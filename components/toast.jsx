import { useToast, Wrap, WrapItem, Button } from "@chakra-ui/react";
export function StatusToast({ toastIdRef }) {
  const toast = useToast();
  return (
    <Wrap>
      <WrapItem>
        <Button
          ref={toastIdRef}
          onClick={(description, status) => {
            console.log(description, status);

            toast({
              title: description,
              status: status,
              isClosable: true,
            });
          }}
        >
          dsadas
        </Button>
      </WrapItem>
    </Wrap>
  );
}
