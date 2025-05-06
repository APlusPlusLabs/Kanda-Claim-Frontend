"use client"

import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronRight, Car, Wrench, ClipboardCheck, Building2, Users2 } from "lucide-react"
import { LanguageSelector } from "@/components/language-selector"
import { EmergencyContacts } from "@/components/emergency-contacts"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="bg-primary text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <nav className="flex justify-between items-center mb-16">
            <div className="text-2xl font-bold">Kanda Claim</div>
            <div className="flex items-center space-x-2">
              <LanguageSelector />
              <Button asChild className="mr-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Link href="/login">Login</Link>
              </Button>
              <Button variant="secondary">
                <Link href="/register">Register</Link>
              </Button>
            </div>
          </nav>

          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Simplified Auto Insurance Claims for Rwanda</h1>
            <p className="text-xl mb-8">
              Kanda Claim streamlines the auto insurance claim process, making it seamless, easy, and affordable for all
              stakeholders involved.
            </p>
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              <Link href="/register">Get Started</Link>
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            <div className="mt-6">
              <Button
                variant="outline"
                className="w-full sm:w-auto border-2 border-primary/20 hover:border-primary/40 bg-background/50 backdrop-blur-sm"
                onClick={() => router.push("/third-party")}
              >
                <Users2 className="mr-2 h-4 w-4" />
                Third-Party Portal
              </Button>
              <p className="text-sm text-muted-foreground mt-2">
                For third parties involved in incidents with our policyholders
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">For Every Stakeholder</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Car className="h-10 w-10 text-primary" />}
              title="Drivers"
              description="Submit claims easily, track progress in real-time, and communicate directly with insurers and garages."
              href="/register?role=driver"
            />

            <FeatureCard
              icon={<Wrench className="h-10 w-10 text-primary" />}
              title="Garages"
              description="Receive repair requests, submit bids, and manage work orders efficiently."
              href="/register?role=garage"
            />

            <FeatureCard
              icon={<ClipboardCheck className="h-10 w-10 text-primary" />}
              title="Assessors"
              description="Review claims, conduct assessments, and submit detailed reports all in one place."
              href="/register?role=assessor"
            />

            <FeatureCard
              icon={<Building2 className="h-10 w-10 text-primary" />}
              title="Insurers"
              description="Manage claims, process payments, and analyze data for better decision-making."
              href="/register?role=insurer"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>

          <div className="max-w-3xl mx-auto space-y-8">
            <Step
              number="1"
              title="Submit a Claim"
              description="Driver reports an incident and submits claim details with supporting evidence."
            />

            <Step
              number="2"
              title="Assessment"
              description="Insurance company and assessors review the claim and validate documents."
            />

            <Step
              number="3"
              title="Repair Process"
              description="Approved claims proceed to repair, with garages bidding for complex repairs."
            />

            <Step
              number="4"
              title="Settlement"
              description="Payment is processed upon repair completion, and the vehicle is returned to the driver."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Simplify Your Claims Process?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join Kanda Claim today and experience a seamless, transparent, and efficient auto insurance claim management
            system.
          </p>
          <Button size="lg" className="bg-white text-primary hover:bg-white/90">
            <Link href="/register">Register Now</Link>
          </Button>
        </div>
      </section>

      {/* Emergency Contacts Section - Moved to bottom before footer */}
      <section className="py-8 bg-white">
        <div className="container mx-auto px-4">
          <EmergencyContacts />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Kanda Claim</h3>
              <p>Streamlining auto insurance claims in Rwanda.</p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="hover:underline">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="hover:underline">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:underline">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:underline">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">For Users</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/login" className="hover:underline">
                    Login
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:underline">
                    Register
                  </Link>
                </li>
                <li>
                  <Link href="/help" className="hover:underline">
                    Help Center
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <address className="not-italic">
                Kigali, Rwanda
                <br />
                Email: info@kandaclaim.rw
                <br />
                Phone: +250 788 123 456
              </address>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p>&copy; {new Date().getFullYear()} Kanda Claim. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  href,
}: {
  icon: React.ReactNode
  title: string
  description: string
  href: string
}) {
  return (
    <Card className="h-full">
      <CardContent className="pt-6">
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Button variant="outline" asChild>
          <Link href={href}>
            Learn More
            <ChevronRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}

function Step({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex items-start">
      <div className="bg-primary text-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 mt-1">
        {number}
      </div>
      <div className="ml-4">
        <h3 className="text-xl font-semibold mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}
