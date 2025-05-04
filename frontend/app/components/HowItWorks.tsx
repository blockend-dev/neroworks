const HowItWorks = () => (
    <section className="py-20 px-6 bg-white text-gray-800 text-center">
      <h2 className="text-3xl font-bold mb-10">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-6xl mx-auto">
        {[
          {
            title: 'Register & Verify',
            desc: 'Sign up as a freelancer or employer. All accounts are verified on-chain.',
          },
          {
            title: 'Post or Apply for Jobs',
            desc: 'Employers post jobs. Freelancers apply with just one click.',
          },
          {
            title: 'Hire & Pay Securely',
            desc: 'Payments are locked in escrow and released after job completion.',
          },
        ].map((item, i) => (
          <div key={i} className="p-6 border rounded-lg shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
  
  export default HowItWorks