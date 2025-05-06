import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Camera, FileText, Phone, Shield, Truck, ArrowLeft, Car, MapPin, Clock } from "lucide-react"

export default function EmergencyGuidePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Phone className="h-8 w-8 mr-3" />
              <h1 className="text-2xl font-bold">Emergency Guide</h1>
            </div>
            <Button variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <section>
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-700 flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Emergency Contacts
                </CardTitle>
                <CardDescription className="text-blue-600">
                  Important numbers to call in case of an accident
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-700 mb-2">Medical Emergency</h3>
                    <p className="mb-2">For injuries requiring immediate medical attention:</p>
                    <p className="font-bold text-lg">
                      <a href="tel:912" className="text-blue-700 hover:underline">
                        912
                      </a>
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-700 mb-2">Police</h3>
                    <p className="mb-2">To report accidents and get official documentation:</p>
                    <p className="font-bold text-lg">
                      <a href="tel:112" className="text-blue-700 hover:underline">
                        112
                      </a>
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-700 mb-2">Towing Service</h3>
                    <p className="mb-2">For vehicle recovery and transportation:</p>
                    <p className="font-bold text-lg">
                      <a href="tel:+250788123456" className="text-blue-700 hover:underline">
                        +250 788 123 456
                      </a>
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-blue-100">
                    <h3 className="font-semibold text-blue-700 mb-2">Insurance Hotline</h3>
                    <p className="mb-2">For immediate insurance assistance:</p>
                    <p className="font-bold text-lg">
                      <a href="tel:+250788987654" className="text-blue-700 hover:underline">
                        +250 788 987 654
                      </a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">What to Do After an Accident</h2>

            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-blue-600" />
                    Step 1: Ensure Safety
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Check yourself and passengers for injuries</li>
                    <li>Move to a safe location if possible</li>
                    <li>Turn on hazard lights and set up warning triangles if available</li>
                    <li>Call for medical help if anyone is injured</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-blue-600" />
                    Step 2: Contact Authorities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Call police to report the accident (required for insurance claims)</li>
                    <li>Wait for police to arrive and provide your statement</li>
                    <li>Request a copy of the police report or case number</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Camera className="h-5 w-5 mr-2 text-blue-600" />
                    Step 3: Document Everything
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Take photos of all vehicles involved from multiple angles</li>
                    <li>Photograph license plates, driver's licenses, and insurance cards</li>
                    <li>Document the accident scene, including road conditions and traffic signs</li>
                    <li>Take photos of any injuries or property damage</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2 text-blue-600" />
                    Step 4: Exchange Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Exchange names, phone numbers, and addresses with all parties involved</li>
                    <li>Get insurance company names and policy numbers</li>
                    <li>Note vehicle details (make, model, year, license plate)</li>
                    <li>Get contact information from any witnesses</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center">
                    <Phone className="h-5 w-5 mr-2 text-blue-600" />
                    Step 5: Notify Your Insurance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Contact your insurance company as soon as possible</li>
                    <li>Provide all documentation and information collected</li>
                    <li>Follow their instructions for next steps</li>
                    <li>Use Kanda Claim to submit your claim digitally</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">Important Tips</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Report Promptly</h3>
                      <p className="text-sm">Most insurance policies require reporting accidents within 24-48 hours.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-3 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Location Accuracy</h3>
                      <p className="text-sm">Use GPS or landmarks to accurately describe the accident location.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Car className="h-5 w-5 mr-3 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Vehicle Safety</h3>
                      <p className="text-sm">Don't drive a damaged vehicle if it could be unsafe.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start">
                    <Truck className="h-5 w-5 mr-3 text-blue-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold mb-1">Towing Consent</h3>
                      <p className="text-sm">Only allow authorized towing services to move your vehicle.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <div className="flex justify-center mt-8">
            <Button asChild>
              <Link href="/dashboard/driver/claims/new">Submit a Claim Now</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
