import { db } from "../config/db.js";
// La lista cerrada impide que un nombre de tabla provenga directamente del visitante.
export const entities = [
  "projects",
  "skills",
  "experiences",
  "education",
  "achievements",
  "social_links",
  "soft_skills",
];
export async function list(entity, connection = db) {
  if (!entities.includes(entity))
    throw Object.assign(new Error("Recurso no encontrado."), { status: 404 });
  if (entity === "skills")
    return (
      await connection.query(
        "SELECT s.id,t.name,c.name category,s.description,s.level,s.icon,s.display_order FROM skills s JOIN technologies t ON t.id=s.technology_id JOIN skill_categories c ON c.id=s.category_id ORDER BY s.display_order,s.id",
      )
    )[0];
  const rows = (
    await connection.query(
      `SELECT * FROM ${entity} ORDER BY ${entity === "projects" ? "is_featured DESC," : ""}display_order,id`,
    )
  )[0];
  if (entity === "projects") {
    const links = (
      await connection.query(
        "SELECT pt.project_id,t.name FROM project_technologies pt JOIN technologies t ON t.id=pt.technology_id ORDER BY t.name",
      )
    )[0];
    return rows.map((row) => ({
      ...row,
      technologies: links
        .filter((t) => t.project_id === row.id)
        .map((t) => t.name),
    }));
  }
  return rows;
}
async function reference(connection, table, name) {
  await connection.execute(
    `INSERT INTO ${table}(name) VALUES (?) ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)`,
    [name],
  );
  return (
    await connection.execute(`SELECT id FROM ${table} WHERE name=?`, [name])
  )[0][0].id;
}
export async function save(entity, data, id) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const { technologies, ...record } = data;
    if (entity === "skills") {
      record.technology_id = await reference(
        connection,
        "technologies",
        record.name,
      );
      record.category_id = await reference(
        connection,
        "skill_categories",
        record.category,
      );
      delete record.name;
      delete record.category;
    }
    const fields = Object.keys(record);
    if (id) {
      const [exists] = await connection.execute(
        `SELECT id FROM ${entity} WHERE id=?`,
        [id],
      );
      if (!exists.length)
        throw Object.assign(new Error("El elemento ya no existe."), {
          status: 404,
        });
      await connection.execute(
        `UPDATE ${entity} SET ${fields.map((f) => `${f}=?`).join(",")} WHERE id=?`,
        [...Object.values(record), id],
      );
    } else {
      const [result] = await connection.execute(
        `INSERT INTO ${entity} (${fields.join(",")}) VALUES (${fields.map(() => "?").join(",")})`,
        Object.values(record),
      );
      id = result.insertId;
    }
    if (entity === "projects") {
      await connection.execute(
        "DELETE FROM project_technologies WHERE project_id=?",
        [id],
      );
      for (const name of new Set(technologies)) {
        const techId = await reference(connection, "technologies", name);
        await connection.execute(
          "INSERT INTO project_technologies VALUES (?,?)",
          [id, techId],
        );
      }
    }
    await connection.commit();
    return { id };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
