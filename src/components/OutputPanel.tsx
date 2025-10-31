import { Box, Heading, Text, VStack } from '@chakra-ui/react';
import { safeStringify } from '../utils/codeTransform';

interface OutputPanelProps {
  result: unknown;
  error: string | null;
  consoleOutput: string[];
}

export const OutputPanel = ({ result, error, consoleOutput }: OutputPanelProps) => {
  return (
    <VStack align="stretch" spacing={4} width="100%">
      {/* Console Output */}
      {consoleOutput.length > 0 ? (
        <Box>
          <Heading size="sm" mb={2}>
            Console Output
          </Heading>
          <Box
            backgroundColor="gray.800"
            padding={4}
            borderRadius="md"
            border="1px solid"
            borderColor="gray.600"
            fontFamily="'Courier New', monospace"
            fontSize="sm"
            maxHeight="200px"
            overflowY="auto"
          >
            {consoleOutput.map((log, index) => (
              <Text key={index} color="gray.300" whiteSpace="pre-wrap">
                {log}
              </Text>
            ))}
          </Box>
        </Box>
      ) : null}

      {/* Result */}
      {result ? (
        <Box>
          <Heading size="sm" mb={2} color="green.400">
            Result
          </Heading>
          <Box
            backgroundColor="gray.800"
            padding={4}
            borderRadius="md"
            border="1px solid"
            borderColor="green.600"
            fontFamily="'Courier New', monospace"
            fontSize="sm"
            maxHeight="300px"
            overflowY="auto"
          >
            <Text color="green.300" whiteSpace="pre-wrap">
              {safeStringify(result, 2)}
            </Text>
          </Box>
        </Box>
      ) : null}

      {/* Error */}
      {error ? (
        <Box>
          <Heading size="sm" mb={2} color="red.400">
            Error
          </Heading>
          <Box
            backgroundColor="gray.800"
            padding={4}
            borderRadius="md"
            border="1px solid"
            borderColor="red.600"
            fontFamily="'Courier New', monospace"
            fontSize="sm"
            maxHeight="300px"
            overflowY="auto"
          >
            <Text color="red.300" whiteSpace="pre-wrap">
              {error}
            </Text>
          </Box>
        </Box>
      ) : null}
    </VStack>
  );
};

