import { testimonials } from "@/StaticData/Static";

const Testimonials: React.FC = () => {
  return (
    <section className="w-full bg-transparent">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-12 sm:py-16 md:py-20 lg:py-24">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-cyan-200 mb-8 text-center">
          Event Overview
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 lg:gap-16 max-w-6xl mx-auto">
          {testimonials.map(({ id, quote, author }) => (
            <div
              key={id}
              className="flex flex-col items-center p-6 bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <span className="text-4xl font-semibold text-cyan-200 mb-2">
                ❝
              </span>
              <p className="text-base sm:text-lg italic text-gray-300 mb-4 text-center">
                {quote}
              </p>
              <p className="text-cyan-100 font-medium mt-auto">{author}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
