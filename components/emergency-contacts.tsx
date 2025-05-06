"use client"

import { Phone, Camera, FileText, AlertTriangle, Truck, Shield } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useLanguage } from "@/lib/language-context"

export function EmergencyContacts() {
  const { t } = useLanguage()

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-blue-700 flex items-center">
          <Phone className="mr-2 h-5 w-5" />
          {t("emergency.title")}
        </CardTitle>
        <CardDescription className="text-blue-600">{t("emergency.subtitle")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-blue-700 mb-2">{t("emergency.contacts")}</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">
                  {t("emergency.ambulance")}:{" "}
                  <a href="tel:912" className="text-blue-700 hover:underline">
                    912
                  </a>
                </span>
              </li>
              <li className="flex items-center">
                <Shield className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">
                  {t("emergency.police")}:{" "}
                  <a href="tel:112" className="text-blue-700 hover:underline">
                    112
                  </a>
                </span>
              </li>
              <li className="flex items-center">
                <Truck className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">
                  {t("emergency.towing")}:{" "}
                  <a href="tel:+250788123456" className="text-blue-700 hover:underline">
                    +250 788 123 456
                  </a>
                </span>
              </li>
              <li className="flex items-center">
                <Phone className="h-4 w-4 mr-2 text-blue-600" />
                <span className="font-medium">
                  {t("emergency.insurance_hotline")}:{" "}
                  <a href="tel:+250788987654" className="text-blue-700 hover:underline">
                    +250 788 987 654
                  </a>
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-blue-700 mb-2">{t("emergency.first_steps")}</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                <span>{t("emergency.ensure_safety")}</span>
              </li>
              <li className="flex items-start">
                <Camera className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                <span>{t("emergency.take_photos")}</span>
              </li>
              <li className="flex items-start">
                <FileText className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                <span>{t("emergency.exchange_info")}</span>
              </li>
              <li className="flex items-start">
                <Shield className="h-4 w-4 mr-2 text-blue-600 mt-0.5" />
                <span>{t("emergency.report_police")}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            className="border-blue-200 text-blue-700 hover:bg-blue-100 hover:text-blue-800"
            asChild
          >
            <Link href="/emergency-guide">{t("emergency.view_full_guide")}</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
