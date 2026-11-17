'use client';

import { Button, Container, Stack, Text, Title } from '@mantine/core';

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <Container size="sm" py="xl">
      <Stack align="flex-start">
        <Title order={1} size="h2">
          We could not display this page
        </Title>
        <Text>Please try loading the page again.</Text>
        <Button onClick={() => retry()}>Try again</Button>
      </Stack>
    </Container>
  );
}
