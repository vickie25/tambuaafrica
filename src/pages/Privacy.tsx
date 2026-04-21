import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";

const Privacy = () => {
  return (
    <PageTransition>
      <Navbar />
      <div className="pt-24 pb-16 bg-background">
        <div className="container-wide mx-auto section-padding">
          <div className="max-w-4xl mx-auto space-y-8 text-foreground">
            <div className="text-center space-y-3">
              <h1 className="text-4xl sm:text-5xl font-bold font-playfair text-primary">Privacy Policy</h1>
              <p className="text-muted-foreground text-lg">
                How Tambua Africa Tours & Safaris handles your personal data.
              </p>
            </div>

            <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border space-y-6 leading-relaxed">
              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-primary">1. Data We Collect</h2>
                <p>
                  We collect contact and booking-related information that you submit through forms, account sign-in,
                  and booking flows, including name, email, phone number, travel preferences, and inquiry details.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-primary">2. How We Use Your Data</h2>
                <p>
                  Your data is used to provide safari planning, booking support, payment processing, customer service,
                  and operational communication related to your itinerary.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-primary">3. Data Sharing</h2>
                <p>
                  We only share required information with trusted service providers and partners involved in delivering
                  your booking (for example payment providers and accommodation partners), and only where necessary.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-primary">4. Security and Retention</h2>
                <p>
                  We apply reasonable technical and organizational measures to protect personal data and retain it only
                  for as long as necessary for legal, operational, and customer-support purposes.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-primary">5. Your Rights</h2>
                <p>
                  You may request access, correction, or deletion of your personal data by contacting us at
                  <span className="font-medium"> info@tambuaafrica.com</span>.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-xl font-semibold text-primary">6. Updates to This Policy</h2>
                <p>
                  We may update this policy periodically to reflect service or legal changes. The latest version is
                  always published on this page.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </PageTransition>
  );
};

export default Privacy;
