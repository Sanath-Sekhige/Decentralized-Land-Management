const steps = [
  {
    number: 1,
    title: "Connect Wallet",
    description: "Link your MetaMask wallet to get started securely",
  },
  {
    number: 2,
    title: "Create Profile",
    description: "Set up your account and complete your profile",
  },
  {
    number: 3,
    title: "List or Search",
    description: "List your land or search nearby properties on the map",
  },
  {
    number: 4,
    title: "Trade & Own",
    description: "Complete transactions and own land on the blockchain",
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-card/30">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold mb-4">How LandChain Works</h2>
          <p className="text-lg text-muted-foreground">Get started in just 4 simple steps</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <div key={i} className="relative">
              <div className="card-dark p-6 h-full">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center mb-4 font-bold">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-2 top-1/3 w-4 h-1 bg-gradient-to-r from-purple-600 to-blue-600"></div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
