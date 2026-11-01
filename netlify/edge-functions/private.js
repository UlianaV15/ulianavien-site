// Закрывает весь сайт паролем до запуска (бесплатная замена Visitor access на Pro).
// Пароль в переменной Netlify SITE_PASSWORD, логин любой. Без переменной сайт закрыт для всех.
// Чтобы открыть сайт, удалить этот файл и выложить.
export default async (request, context) => {
  const password = Netlify.env.get("SITE_PASSWORD");
  const auth = request.headers.get("authorization") || "";
  if (password && auth.startsWith("Basic ")) {
    const decoded = atob(auth.slice(6));
    if (decoded.slice(decoded.indexOf(":") + 1) === password) return context.next();
  }
  return new Response("Сайт скоро откроется.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="ulianavien", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
      "X-Robots-Tag": "noindex",
    },
  });
};

export const config = { path: "/*" };
