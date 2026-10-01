export default function sitemap() {
  const baseUrl = 'https://decordesigns.online';
  const currentDate = new Date().toISOString();

  const routes = [
    '',
    '/about',
    '/services',
    '/gallery',
    '/packages',
    '/rental',
    '/contact',
    '/login',
    '/register',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route === '' || route === '/packages' || route === '/rental' ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route === '/packages' || route === '/rental' || route === '/services' ? 0.9 : 0.7,
  }));
}
