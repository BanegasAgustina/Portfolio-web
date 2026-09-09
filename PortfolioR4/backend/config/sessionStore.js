import session from "express-session";
import { db } from "./db.js";
// Adaptador pequeño de express-session: conserva sesiones entre reinicios sin otra copia del driver SQL.
export class SQLSessionStore extends session.Store {
  constructor() {
    super();
    this.timer = setInterval(
      () =>
        db
          .execute("DELETE FROM admin_sessions WHERE expires_at < ?", [
            Date.now(),
          ])
          .catch((error) => console.error(error.code)),
      15 * 60000,
    );
    this.timer.unref();
  }
  get(id, callback) {
    db.execute(
      "SELECT data FROM admin_sessions WHERE session_id=? AND expires_at>?",
      [id, Date.now()],
    )
      .then(([rows]) =>
        callback(null, rows.length ? JSON.parse(rows[0].data) : null),
      )
      .catch(callback);
  }
  set(id, data, callback) {
    const expires = data.cookie.expires
      ? new Date(data.cookie.expires).getTime()
      : Date.now() + 8 * 3600000;
    db.execute(
      "INSERT INTO admin_sessions(session_id,expires_at,data) VALUES (?,?,?) ON DUPLICATE KEY UPDATE expires_at=VALUES(expires_at),data=VALUES(data)",
      [id, expires, JSON.stringify(data)],
    )
      .then(() => callback?.())
      .catch((error) => callback?.(error));
  }
  destroy(id, callback) {
    db.execute("DELETE FROM admin_sessions WHERE session_id=?", [id])
      .then(() => callback?.())
      .catch((error) => callback?.(error));
  }
  touch(id, data, callback) {
    db.execute("UPDATE admin_sessions SET expires_at=? WHERE session_id=?", [
      new Date(data.cookie.expires).getTime(),
      id,
    ])
      .then(() => callback?.())
      .catch((error) => callback?.(error));
  }
}
