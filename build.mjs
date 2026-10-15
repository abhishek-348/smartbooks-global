import { mkdir, copyFile, cp, rm } from 'node:fs/promises';
await rm('public', { recursive: true, force: true });
await mkdir('public', { recursive: true });
for (const file of ['index.html', 'Smartbooks_Website.html', '404.html', 'style.css', 'app.js', 'services.json', 'favicon.svg', 'robots.txt', 'sitemap.xml']) {
  await copyFile(file, `public/${file}`);
}
for (const directory of ['founder-clarity', 'assets', 'services', 'pricing', 'solutions', 'about', 'contact', 'resources', 'privacy', 'terms']) {
  await cp(directory, `public/${directory}`, { recursive: true });
}
