import { Star } from "lucide-react";
import React, { useState } from "react";

// Define the Testimonial type

const testimonials = [
  {
    id: "t1",
    name: "Sarah Johnson",
    image: "/api/placeholder/60/60",
    rating: 5,
    quote:
      "EventWise helped me stay under budget while planning my dream wedding!",
    eventType: "Wedding",
  },
  {
    id: "t2",
    name: "Michael Rodriguez",
    image: "/api/placeholder/60/60",
    rating: 5,
    quote:
      "Our company conference was a huge success thanks to the organization tools.",
    eventType: "Corporate Conference",
  },
  {
    id: "t3",
    name: "Emily Chen",
    image: "/api/placeholder/60/60",
    rating: 4,
    quote: "The vendor recommendations saved me hours of research time.",
    eventType: "Charity Gala",
  },
];

const Testimonials: React.FC = () => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  return (
    <div className="bg-blue-950 rounded-lg shadow-sm p-6 mt-6">
      <h2 className="text-lg font-medium text-gray-300 mb-6">
        Success Stories
      </h2>

      <div className="relative">
        <div className="overflow-hidden">
          <div
            className="flex transition-transform duration-300"
            style={{
              transform: `translateX(-${activeTestimonial * 100}%)`,
            }}
          >
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.id} className="w-full flex-shrink-0 px-4">
                <div className="bg-blue-900 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full mr-4"
                    />
                    <div>
                      <h3 className="font-medium text-gray-300">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {testimonial.eventType}
                      </p>
                      <div className="flex mt-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            size={14}
                            className={
                              i < testimonial.rating
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-300 italic">"{testimonial.quote}"</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-4 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTestimonial(index)}
              className={`w-2 h-2 rounded-full ${
                activeTestimonial === index ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
