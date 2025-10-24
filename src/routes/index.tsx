import {
  Box,
  Button,
  Container,
  Flex,
  Group,
  Heading,
  Icon,
  Image,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from '@chakra-ui/react';
import { Link, createFileRoute } from '@tanstack/react-router';
import { LuCheckCheck, LuGamepad2, LuLink, LuNotebook } from 'react-icons/lu';

export const Route = createFileRoute('/')({
  component: App,
  head: () => ({
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebApplication',
          name: 'GrindPad',
          description:
            'Task management application for MMO gamers to track dailies, organize builds, and manage gaming sessions across multiple games and characters',
          url: 'https://grindpad.com',
          applicationCategory: 'GameApplication',
          operatingSystem: 'Web',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
          featureList: [
            'Track daily and weekly MMO tasks',
            'Rich text notes for builds and rotations',
            'Resource library for guides and links',
            'Multi-game character management',
          ],
        }),
      },
    ],
  }),
});

function App() {
  return (
    <Box>
      <Box h={{ base: '40vh', md: '45vh' }}>
        <Container
          pos="relative"
          h="100%"
          display="flex"
          flexDir="column"
          alignItems="center"
          justifyContent="center"
          maxW={{ base: 'lg', md: '6xl' }}
        >
          <Box>
            <Heading
              size={{ base: '4xl', md: '6xl' }}
              fontWeight="bolder"
              mb="6"
            >
              Your Gaming Sessions, Organized
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} mb="4">
              Track dailies, save build guides, and organize resources across
              all your various games. Built by a gamer who got tired of
              scattered notes.
            </Text>
            <Button asChild>
              <Link to="/signup">Start Grinding</Link>
            </Button>
          </Box>
        </Container>
      </Box>

      <Box bg="bg.panel" py={{ base: '10', md: '20' }}>
        <Container maxW={{ base: 'lg', md: '8xl' }}>
          <Heading
            as="h2"
            size={{ base: '2xl', md: '3xl' }}
            textAlign="center"
            pb={{ base: '8', md: '12' }}
          >
            This you?
          </Heading>
          <SimpleGrid
            columns={{ base: 1, md: 3 }}
            gap={{ base: '6', md: '10' }}
          >
            {struggleCards.map((card, idx) => (
              <Box
                key={idx}
                bg="bg.emphasized"
                rounded="md"
                p={{ base: '6', md: '8' }}
                borderWidth="1px"
                borderColor="border.emphasized"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  borderColor: 'purple.500',
                }}
              >
                <Heading as="h3" size={{ base: 'lg', md: 'xl' }} mb="4">
                  {card.title}
                </Heading>
                <Text fontSize={{ base: 'md' }}>{card.paragraph}</Text>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box as="section" py={{ base: '10', md: '20' }}>
        <Container maxW={{ base: 'lg', md: '8xl' }}>
          <Stack pb={{ base: '8', md: '12' }}>
            <Heading
              as="h2"
              size={{ base: '2xl', md: '3xl' }}
              textAlign="center"
            >
              Everything in One Place
            </Heading>
            <Text textAlign="center" fontSize="lg" color="fg.muted">
              GrindPad keeps you organized.
            </Text>
          </Stack>

          <SimpleGrid
            columns={{ base: 1, md: 2, lg: 4 }}
            gap={{ base: '6', md: '10' }}
          >
            {features.map((feature, index) => (
              <Box
                key={index}
                bg="bg.emphasized"
                p={{ base: '6', md: '8' }}
                rounded="md"
                borderWidth="1px"
                borderColor="border.emphasized"
                transition="all 0.2s"
                _hover={{
                  transform: 'translateY(-2px)',
                  borderColor: 'purple.500',
                }}
              >
                <Flex gap={4} direction="column" align="start">
                  <Box
                    w={12}
                    h={12}
                    bg="purple.500"
                    rounded="md"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon size="xl">{feature.icon}</Icon>
                  </Box>

                  <Heading as="h3" size={{ base: 'lg', md: 'xl' }}>
                    {feature.title}
                  </Heading>

                  <Text fontSize={{ base: 'md' }}>{feature.description}</Text>
                </Flex>
              </Box>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      <Box as="section" bg="bg.emphasized" py={{ base: '10', md: '20' }}>
        <Container maxW={{ base: 'lg', md: '8xl' }}>
          <VStack gap={{ base: '4', md: '6' }} textAlign="center">
            <Image
              src="/gp_transparent.png"
              height="100px"
              alt="GrindPad logo"
            />
            <Heading as="h2" size={{ base: '2xl', md: '3xl' }}>
              Built by a Gamer, for Gamers
            </Heading>

            <Text fontSize={{ base: 'lg', md: 'xl' }}>
              This is not a micro SaaS. It's just a helpful tool.
            </Text>

            <Text fontSize={{ base: 'lg', md: 'xl' }}>
              This started as a personal project to solve my own MMO
              organization problems.
            </Text>

            <Text
              fontSize={{ base: 'lg', md: 'xl' }}
              color="purple.400"
              fontWeight="medium"
            >
              Free to use, no premium tiers, no paywalls.
            </Text>
          </VStack>
        </Container>
      </Box>

      <Box as="section" bg="bg.panel" py={{ base: '10', md: '20' }}>
        <Container maxW={{ base: 'lg', md: '8xl' }}>
          <VStack gap={{ base: '6', md: '8' }} textAlign="center">
            <Heading as="h2" size={{ base: '2xl', md: '3xl' }}>
              Ready to Get Organized?
            </Heading>

            <Text fontSize={{ base: 'lg', md: 'xl' }}>
              Join fellow gamers who've stopped losing track of their progress.
            </Text>

            <Group gap="4">
              <Button size="xl" asChild>
                <Link to="/signup">Create Your Account</Link>
              </Button>
              <Button size="xl" variant="outline" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </Group>
          </VStack>
        </Container>
      </Box>

      <Box
        as="footer"
        borderTopWidth="1px"
        borderColor="border.emphasized"
        py={{ base: '6', md: '8' }}
      >
        <Container maxW={{ base: 'lg', md: '8xl' }}>
          <Stack color="fg.muted" textAlign="center" fontSize="sm">
            <Text>&copy;{new Date().getFullYear()} GrindPad</Text>
            <Text> Made with coffee and too many late-night raids.</Text>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}

const struggleCards = [
  {
    title: 'Lost in Your Notes',
    paragraph:
      'That perfect rotation guide you bookmarked last week? Good luck finding it buried in browser tabs or scattered text files.',
  },
  {
    title: 'Glorious Grind',
    paragraph:
      'Love grinding through your games, but having trouble planning what you want to do? There is nothing worse than an inefficient grind.',
  },
  {
    title: 'Session Amnesia',
    paragraph:
      'You log in ready to play, then spend the first 10 minutes remembering what you were working on and where you left off.',
  },
];

const features = [
  {
    icon: <LuCheckCheck />,
    title: 'Track Your Grind',
    description:
      "Daily, weekly, and custom tasks organized by game. Never forget which dailies you've completed.",
  },
  {
    icon: <LuNotebook />,
    title: 'Rich Notes',
    description:
      'Save rotations, builds, and strategies with rich text formatting. Code blocks for macros, lists for gear priorities.',
  },
  {
    icon: <LuLink />,
    title: 'Resource Library',
    description:
      'Bookmark external guides, tier lists, and tools. Tag and search to find exactly what you need, when you need it.',
  },
  {
    icon: <LuGamepad2 />,
    title: 'Multi-Game Ready',
    description:
      "Switch between games seamlessly. Whether you're raiding in WoW, questing in FFXIV, or grinding in OSRS, you can keep everything organized.",
  },
];
