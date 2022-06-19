import type { LoaderFunction } from '@remix-run/server-runtime';
import { redirect } from '@remix-run/server-runtime';

import { db } from '~/services/db.server';

export const loader: LoaderFunction = async ({ request }) => {
  const hash = new URL(request.url).pathname.slice(1);

  const url = await db.url.findUnique({ where: { hash } });

  if (url) {
    return redirect(`https://${url.originalUrl}`);
  }

  return redirect('/');
};
