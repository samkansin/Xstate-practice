"use client";

import { FetchMachineContextType, fetchMachine } from "@/machines";
import { ProductServiceResponseType } from "@/types";
import { Card, CardBody, CardFooter } from "@nextui-org/card";
import { Image } from "@nextui-org/image";
import { Button, Spinner } from "@nextui-org/react";
import { useMachine, useSelector } from "@xstate/react";
import { useMemo } from "react";

export default function Home() {
  const [state, send, actorRef] = useMachine(fetchMachine);

  const selectData = (snapshot: any) =>
    snapshot.context as FetchMachineContextType<ProductServiceResponseType>;
  const { data, error, retry } = useSelector(actorRef, selectData);

  const handleFetchButtonClick = () => {
    send({
      type: "FETCH",
      url: "https://dummyjson.com/products",
      method: "GET",
      headers: new Headers(),
    });
  };

  const handleRetryButtonClick = () => {
    send({ type: "RETRY" });
  };

  const isLoading = useMemo(() => {
    return state.matches("loading");
  }, [state.value]);

  const isRetryLoading = useMemo(() => {
    return retry < 3 && state.matches("failure");
  }, [state.value]);

  return (
    <div>
      <center className="mt-5">
        <p>Welcome to Xstate practice</p>
        <div className="flex gap-5 justify-center mt-5 mb-5">
          <Button
            color="primary"
            className="w-[150px]"
            onClick={handleFetchButtonClick}
          >
            Fetch
          </Button>
          <Button
            color="warning"
            className="w-[150px]"
            onClick={handleRetryButtonClick}
          >
            Retry
          </Button>
        </div>
        {error ? <p className="text-red-600">Error: {error}</p> : <></>}
        {isLoading ? (
          <Spinner label="Loading..." color="primary" className="mt-10" />
        ) : (
          <></>
        )}
        {isRetryLoading ? (
          <Spinner
            label={`Retry round ${retry}`}
            color="secondary"
            className="mt-10"
          />
        ) : (
          <></>
        )}
        {data ? (
          <div className="gap-2 grid grid-cols-2 sm:grid-cols-4">
            {data.products.map((product) => (
              <Card
                key={product.id}
                className="border-none"
                shadow="sm"
                isBlurred
                isPressable
                onPress={() => console.log()}
              >
                <CardBody>
                  <Image
                    shadow="sm"
                    radius="lg"
                    width="100%"
                    alt={product.title}
                    className="w-full object-cover h-[150px]"
                    src={product.thumbnail}
                  />
                </CardBody>
                <CardFooter className="text-small justify-between">
                  <b>{product.title}</b>
                  <p className="text-default-500">{product.price}</p>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <></>
        )}
      </center>
    </div>
  );
}
