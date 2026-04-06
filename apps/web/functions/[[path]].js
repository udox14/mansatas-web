export async function onRequest(context) {
  const { request, next } = context;
  const url = new URL(request.url);

  // 1. Lewatkan jika ini adalah file statis (punya titik di namanya seperti main.js, style.css, logo.png)
  if (url.pathname.includes('.')) {
    return next();
  }

  // 2. Jika tidak diakhiri '/', tambahkan '/' dan redirect agar Next.js Static Export tidak 404
  if (!url.pathname.endsWith('/')) {
    url.pathname += '/';
    return Response.redirect(url.toString(), 301);
  }

  // 3. Biarkan sisa request berjalan normal
  return next();
}
