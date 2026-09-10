import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

test("PostgreSQL: esquema, semilla, RLS, privacidad, CRUD y Storage", async (t) => {
  const db = new PGlite();
  const admin = "11111111-1111-4111-8111-111111111111";
  const visitor = "22222222-2222-4222-8222-222222222222";
  try {
    // Sólo simula infraestructura de Supabase; el esquema y las políticas son los archivos reales.
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      grant usage on schema auth to anon,authenticated;
      create schema storage;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id bigint generated always as identity,name text,bucket_id text);
      alter table storage.objects enable row level security;
      grant usage on schema storage to anon,authenticated;
      grant select,insert,update,delete on storage.objects to anon,authenticated;
      grant usage on all sequences in schema storage to anon,authenticated;
      create function storage.foldername(name text) returns text[] language sql as $$ select string_to_array(name,'/') $$;
      insert into auth.users values ('${admin}'),('${visitor}');`);
    const schema = await readFile(
      new URL("../supabase/schema.sql", import.meta.url),
      "utf8",
    );
    const seed = await readFile(
      new URL("../supabase/seed.sql", import.meta.url),
      "utf8",
    );
    await db.exec(schema);
    await db.exec(seed);
    await db.exec(schema);
    await db.exec(seed); // Reejecución no destruye datos.
    await db.exec(
      `insert into private.admin_users(user_id) values('${admin}'); update public.profile set phone='dato privado',show_phone=false;`,
    );
    async function role(name, user = "") {
      await db.exec("reset role");
      await db.query("select set_config('request.jwt.claim.sub',$1,false)", [
        user,
      ]);
      await db.exec(`set role ${name}`);
    }
    await t.test(
      "lectura pública, teléfono oculto y bloqueo anónimo",
      async () => {
        await role("anon");
        assert.ok(
          (await db.query("select * from public.projects")).rows.length,
        );
        const profile = (
          await db.query("select public.get_public_profile() as profile")
        ).rows[0].profile;
        assert.equal("phone" in profile, false);
        await assert.rejects(db.query("select * from public.profile"));
        await assert.rejects(db.query("select * from public.contact_messages"));
        await assert.rejects(
          db.query("insert into public.soft_skills(name) values('invasión')"),
        );
        await assert.rejects(
          db.query(
            `insert into storage.objects(name,bucket_id) values('test.png','portfolio-images')`,
          ),
        );
      },
    );
    await t.test(
      "usuario autenticado sin autorización no puede editar ni autoasignarse admin",
      async () => {
        await role("authenticated", visitor);
        assert.equal(
          (await db.query("select public.is_admin() as allowed")).rows[0]
            .allowed,
          false,
        );
        await assert.rejects(
          db.query("insert into public.soft_skills(name) values('invasión')"),
        );
        assert.equal(
          (
            await db.query(
              "update public.projects set title='invasión' returning id",
            )
          ).rows.length,
          0,
        );
        assert.equal(
          (await db.query("delete from public.projects returning id")).rows
            .length,
          0,
        );
        await assert.rejects(
          db.query(`insert into private.admin_users values('${visitor}')`),
        );
        await assert.rejects(
          db.query(
            `insert into storage.objects(name,bucket_id) values('${visitor}/test.png','portfolio-images')`,
          ),
        );
        await assert.rejects(
          db.query(`select public.save_profile('{}'::jsonb)`),
        );
      },
    );
    await t.test(
      "admin puede crear, leer, modificar y eliminar; restricciones y secuencias correctas",
      async () => {
        await role("authenticated", admin);
        assert.equal(
          (await db.query("select public.is_admin() as allowed")).rows[0]
            .allowed,
          true,
        );
        const {
          rows: [row],
        } = await db.query(
          "insert into public.projects(title,description,category,technologies) values('Prueba','Proyecto temporal','Full Stack',array['React']) returning id",
        );
        assert.ok(Number(row.id) > 1);
        await db.query(
          "update public.projects set description='Cambio persistente' where id=$1",
          [row.id],
        );
        assert.equal(
          (
            await db.query(
              "select description from public.projects where id=$1",
              [row.id],
            )
          ).rows[0].description,
          "Cambio persistente",
        );
        await assert.rejects(
          db.query(
            "update public.projects set demo='javascript:alert(1)' where id=$1",
            [row.id],
          ),
        );
        await db.query("delete from public.projects where id=$1", [row.id]);
        assert.equal(
          (
            await db.query("select id from public.projects where id=$1", [
              row.id,
            ])
          ).rows.length,
          0,
        );
        await db.query(
          `insert into storage.objects(name,bucket_id) values('${admin}/test.png','portfolio-images')`,
        );
        await assert.rejects(
          db.query(
            `insert into storage.objects(name,bucket_id) values('${admin}/test.png','otro-bucket')`,
          ),
        );
        await db.query("update public.profile set show_phone=true where id=1");
        await role("anon");
        assert.equal(
          (await db.query("select public.get_public_profile() as profile"))
            .rows[0].profile.phone,
          "dato privado",
        );
      },
    );
    await t.test("todas las tablas de contenido tienen RLS", async () => {
      await role("postgres");
      const { rows } = await db.query(
        "select relname,relrowsecurity from pg_class join pg_namespace n on n.oid=relnamespace where n.nspname='public' and relkind='r'",
      );
      assert.equal(rows.length, 8);
      assert.ok(rows.every((row) => row.relrowsecurity));
    });
  } finally {
    await db.close();
  }
});
