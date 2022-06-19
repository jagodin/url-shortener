import type { PropsWithChildren } from 'react';
import { useEffect, useState } from 'react';
import { ContentCopy } from '@mui/icons-material';
import LoadingButton from '@mui/lab/LoadingButton';
import {
  Alert,
  Box,
  Card,
  Grid,
  IconButton,
  Link,
  Snackbar,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  Form,
  useActionData,
  useCatch,
  useNavigate,
  useTransition,
} from '@remix-run/react';
import type { Transition } from '@remix-run/react/transition';
import type { ActionFunction } from '@remix-run/server-runtime';
import { json } from '@remix-run/server-runtime';

import { createURL, isValidURL } from '~/services/url.server';

interface ActionData {
  hash: string;
}

export const action: ActionFunction = async ({ request }) => {
  const body = await request.formData();

  const url = body.get('url') as string;

  if (!url) {
    throw new Response('Could not parse URL', { status: 500 });
  }

  if (!isValidURL(url)) {
    throw new Response('Invalid URL', { status: 400 });
  }

  const hash = await createURL(url);

  return json({ hash });
};

export default function Index() {
  const transition = useTransition();

  return <IndexLayout transition={transition} />;
}

export function CatchBoundary() {
  return <Boundary />;
}

export function ErrorBoundary() {
  return <Boundary />;
}

function Boundary() {
  const caught = useCatch();
  const [open, setOpen] = useState(true);
  const navigate = useNavigate();

  const handleClose = () => {
    setOpen(false);
    navigate('/');
  };

  return (
    <IndexLayout>
      <Snackbar
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={open}
        onClose={handleClose}
        autoHideDuration={2500}
      >
        <Alert onClose={handleClose} severity="error">
          {JSON.stringify(caught)}
        </Alert>
      </Snackbar>
    </IndexLayout>
  );
}

interface IndexLayoutProps extends PropsWithChildren<unknown> {
  transition?: Transition;
}

function IndexLayout({ children, transition }: IndexLayoutProps) {
  const [host, setHost] = useState('');
  const data = useActionData<ActionData>();
  const hash = data?.hash;
  const url = `https://${host}/${hash}`;

  useEffect(() => {
    setHost(window.location.host);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100%',
      }}
    >
      <Grid
        justifyContent="center"
        alignItems="center"
        container
        rowGap={6}
        sx={{
          padding: (theme) => theme.spacing(0, 2),
          paddingTop: (theme) => theme.spacing(6),
        }}
      >
        {children}
        <Grid item xs={12}>
          <Typography textAlign="center" variant="h4">
            URL Shortener
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Form method="post">
            <Card
              elevation={4}
              sx={(theme) => ({
                padding: theme.spacing(6),
                maxWidth: '600px',
                marginLeft: 'auto',
                marginRight: 'auto',
              })}
            >
              <Grid direction="column" container rowGap={2}>
                <TextField fullWidth label="URL" name="url" required />
                <LoadingButton
                  disabled={transition?.state !== 'idle'}
                  variant="contained"
                  type="submit"
                  loading={transition?.state === 'submitting'}
                >
                  Submit
                </LoadingButton>
              </Grid>
            </Card>
          </Form>
        </Grid>
        {hash && (
          <Grid item xs={12} container justifyContent="center">
            <Alert sx={{ alignItems: 'center' }} severity="success">
              <Grid
                container
                alignItems="center"
                columnGap={2}
                justifyContent="space-between"
              >
                <Grid item>
                  <Link underline="hover" target="_blank" href={hash}>
                    <Typography variant="body1">{url}</Typography>
                  </Link>
                </Grid>
                <Grid item>
                  <Tooltip placement="top" title="Copy to Clipboard">
                    <IconButton onClick={handleCopy}>
                      <ContentCopy />
                    </IconButton>
                  </Tooltip>
                </Grid>
              </Grid>
            </Alert>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
