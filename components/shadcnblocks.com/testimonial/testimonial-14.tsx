"use client";

import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { CarouselApi } from "@/components/ui/carousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

const testimonials = [
  {
    id: "testimonial-1",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig doloremque mollitia fugiat omnis! Porro facilis quo animi consequatur. Explicabo.",
    name: "Customer Name",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-1.webp",
  },
  {
    id: "testimonial-2",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig doloremque mollitia fugiat omnis! Porro facilis quo animi consequatur. Explicabo.",
    name: "Customer Name",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-2.webp",
  },
  {
    id: "testimonial-3",
    text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Elig doloremque mollitia fugiat omnis! Porro facilis quo animi consequatur. Explicabo.",
    name: "Customer Name",
    avatar: "https://deifkwefumgah.cloudfront.net/shadcnblocks/block/avatar-3.webp",
  },
];

const Testimonial14 = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    const updateCurrent = () => {
      setCurrent(api.selectedScrollSnap());
    };

    api.on("select", updateCurrent);
    return () => {
      api.off("select", updateCurrent);
    };
  }, [api]);

  return (
    <section className="py-32">
      <Carousel setApi={setApi}>
        <CarouselContent>
          {testimonials.map((testimonial) => (
            <CarouselItem key={testimonial.id}>
              <div className="container flex flex-col items-center text-center">
                <p className="mb-8 max-w-4xl font-medium md:px-8 lg:text-3xl">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <Avatar className="mb-2 size-12 md:size-24">
                  <AvatarImage src={testimonial.avatar} />
                  <AvatarFallback>{testimonial.name}</AvatarFallback>
                </Avatar>
                <p className="mb-1 text-sm font-medium md:text-lg">
                  {testimonial.name}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
      <div className="container flex justify-center py-16">
        {testimonials.map((testimonial, index) => (
          <Button
            key={testimonial.id}
            variant="ghost"
            size="sm"
            onClick={() => {
              api?.scrollTo(index);
            }}
          >
            <div
              className={`size-2.5 rounded-full ${index === current ? "bg-primary" : "bg-input"}`}
            />
          </Button>
        ))}
      </div>
    </section>
  );
};

export { Testimonial14 };
