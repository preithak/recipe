export function NewsletterSection() {
  return (
    <section className="bg-surface-container py-16">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h2 className="font-serif text-3xl text-on-surface mb-3">The Alchemist&apos;s Letter</h2>
        <p className="text-on-surface-variant mb-6">
          Get seasonal recipes and kitchen stories delivered to your inbox.
        </p>
        <form className="flex gap-3 max-w-md mx-auto">
          <input
            type="email"
            placeholder="Your email"
            className="flex-1 px-4 py-3 bg-surface-high rounded-lg text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="submit"
            className="btn-primary whitespace-nowrap"
          >
            Subscribe
          </button>
        </form>
      </div>
    </section>
  )
}
