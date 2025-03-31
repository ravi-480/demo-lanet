import { testimonials } from "@/StaticData/Static";

const Testimonials: React.FC = () => {
  return (
    <section className="container bg-white mx-auto text-black text-center px-6 md:px-20 lg:px-40 py-16">
      <h2 className="text-2xl md:text-3xl font-bold mb-8">Event Overview</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {testimonials.map(({ id, quote, author }) => (
          <div key={id} className="flex flex-col items-center max-w-md mx-auto">
            <span className="text-4xl font-bold text-gray-700">❝</span>
            <p className="text-base sm:text-lg italic font-semibold text-gray-800">
              {quote}
            </p>
            <p className="text-gray-500 mt-2">{author}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
