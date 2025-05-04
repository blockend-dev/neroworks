import Link from 'next/link';

const HomeCTA = () => (
  <section className="bg-indigo-700 text-white py-16 px-6 text-center">
    <h2 className="text-3xl font-bold mb-4">Ready to start your decentralized work journey?</h2>
    <p className="mb-8">Join now and be part of the future of work.</p>
    <Link href="/register">
      <button className="bg-white text-indigo-700 font-semibold px-8 py-3 rounded-full hover:bg-gray-200 transition">
        Create Your Account
      </button>
    </Link>
  </section>
);

export default HomeCTA
