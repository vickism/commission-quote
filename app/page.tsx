import { Container, Stack, Text, Title } from '@mantine/core';
import { CommissionQuoteForm } from '../components/CommissionQuoteForm/CommissionQuoteForm';

export default function HomePage() {
  return (
    <Container component="main" size="sm" py={{ base: 'xl', sm: 64 }}>
      <Stack gap="xl">
        <div>
          <Text c="blue" fw={600} size="sm" tt="uppercase" mb="xs">
            Lending platform
          </Text>
          <Title order={1}>Commission Quote</Title>
          <Text c="dimmed" mt="sm">
            Generate a commission quote from your loan details.
          </Text>
        </div>
        <CommissionQuoteForm />
      </Stack>
    </Container>
  );
}
