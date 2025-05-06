"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/lib/language-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Star, MapPin, Phone, Clock, Filter, ArrowUpDown } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock data for garages
const MOCK_GARAGES = [
  {
    id: 1,
    name: "Kigali Auto Repair",
    address: "KG 123 St, Kigali",
    phone: "+250 788 123 456",
    distance: 1.2, // in km
    rating: 4.5,
    specializations: ["bodywork", "mechanical"],
    openHours: "8:00 - 18:00",
    description: "Professional auto repair services with certified technicians.",
  },
  {
    id: 2,
    name: "Rwanda Motors",
    address: "KN 78 Ave, Kigali",
    phone: "+250 788 234 567",
    distance: 2.5, // in km
    rating: 4.8,
    specializations: ["mechanical", "electrical"],
    openHours: "7:30 - 19:00",
    description: "Specialized in all types of mechanical and electrical repairs.",
  },
  {
    id: 3,
    name: "Premium Auto Care",
    address: "KK 34 St, Kigali",
    phone: "+250 788 345 678",
    distance: 0.8, // in km
    rating: 4.2,
    specializations: ["bodywork", "painting"],
    openHours: "8:00 - 17:00",
    description: "Expert bodywork and painting services for all vehicle makes.",
  },
  {
    id: 4,
    name: "Gasabo Garage",
    address: "KG 543 St, Gasabo",
    phone: "+250 788 456 789",
    distance: 3.7, // in km
    rating: 4.0,
    specializations: ["mechanical", "electrical", "bodywork"],
    openHours: "7:00 - 20:00",
    description: "Full-service garage with 24/7 towing services available.",
  },
  {
    id: 5,
    name: "Nyarugenge Auto Shop",
    address: "KN 32 Ave, Nyarugenge",
    phone: "+250 788 567 890",
    distance: 5.2, // in km
    rating: 4.7,
    specializations: ["mechanical", "diagnostics"],
    openHours: "8:30 - 18:30",
    description: "Advanced diagnostic equipment and skilled technicians.",
  },
]

type Garage = (typeof MOCK_GARAGES)[0]
type Specialization = "bodywork" | "mechanical" | "electrical" | "painting" | "diagnostics"
type SortOption = "distance" | "rating" | "name"

interface GarageRecommendationsProps {
  onSelectGarage: (garage: Garage) => void
  userLocation?: { lat: number; lng: number }
}

export function GarageRecommendations({ onSelectGarage, userLocation }: GarageRecommendationsProps) {
  const { t } = useLanguage()
  const [garages, setGarages] = useState<Garage[]>(MOCK_GARAGES)
  const [filteredGarages, setFilteredGarages] = useState<Garage[]>(MOCK_GARAGES)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecializations, setSelectedSpecializations] = useState<Specialization[]>([])
  const [maxDistance, setMaxDistance] = useState<number>(10) // in km
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<SortOption>("distance")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")

  // Simulate fetching garages based on user location
  useEffect(() => {
    // In a real app, this would be an API call using the user's location
    // For now, we'll just use our mock data
    setGarages(MOCK_GARAGES)
  }, [userLocation])

  // Apply filters and sorting
  useEffect(() => {
    let result = [...garages]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (garage) =>
          garage.name.toLowerCase().includes(query) ||
          garage.address.toLowerCase().includes(query) ||
          garage.description.toLowerCase().includes(query),
      )
    }

    // Apply specialization filter
    if (selectedSpecializations.length > 0) {
      result = result.filter((garage) => selectedSpecializations.some((spec) => garage.specializations.includes(spec)))
    }

    // Apply distance filter
    result = result.filter((garage) => garage.distance <= maxDistance)

    // Apply rating filter
    result = result.filter((garage) => garage.rating >= minRating)

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      if (sortBy === "distance") {
        comparison = a.distance - b.distance
      } else if (sortBy === "rating") {
        comparison = b.rating - a.rating
      } else if (sortBy === "name") {
        comparison = a.name.localeCompare(b.name)
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    setFilteredGarages(result)
  }, [garages, searchQuery, selectedSpecializations, maxDistance, minRating, sortBy, sortDirection])

  const toggleSpecialization = (specialization: Specialization) => {
    setSelectedSpecializations((prev) =>
      prev.includes(specialization) ? prev.filter((s) => s !== specialization) : [...prev, specialization],
    )
  }

  const toggleSortDirection = () => {
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"))
  }

  const formatDistance = (distance: number) => {
    return distance < 1
      ? `${Math.round(distance * 1000)} ${t("garage.meters")}`
      : `${distance.toFixed(1)} ${t("garage.kilometers")}`
  }

  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={cn(
              "h-4 w-4",
              star <= Math.floor(rating)
                ? "text-yellow-500 fill-yellow-500"
                : star <= rating
                  ? "text-yellow-500 fill-yellow-500 opacity-50"
                  : "text-gray-300",
            )}
          />
        ))}
        <span className="ml-1 text-sm">{rating.toFixed(1)}</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder={t("garage.search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                {t("garage.filter")}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <h4 className="mb-2 text-sm font-medium">{t("garage.specializations")}</h4>
                  <div className="flex flex-wrap gap-2">
                    {["bodywork", "mechanical", "electrical", "painting", "diagnostics"].map((spec) => (
                      <Badge
                        key={spec}
                        variant={selectedSpecializations.includes(spec as Specialization) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => toggleSpecialization(spec as Specialization)}
                      >
                        {t(`garage.specialization_${spec}`)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">
                    {t("garage.max_distance")}: {maxDistance} km
                  </h4>
                  <Slider
                    value={[maxDistance]}
                    min={1}
                    max={20}
                    step={1}
                    onValueChange={(value) => setMaxDistance(value[0])}
                  />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium">{t("garage.min_rating")}</h4>
                  <RadioGroup value={minRating.toString()} onValueChange={(value) => setMinRating(Number(value))}>
                    {[0, 3, 3.5, 4, 4.5].map((rating) => (
                      <div key={rating} className="flex items-center space-x-2">
                        <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} />
                        <Label htmlFor={`rating-${rating}`} className="flex items-center">
                          {rating > 0 ? renderRatingStars(rating) : t("garage.any_rating")}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder={t("garage.sort_by")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="distance">{t("garage.distance")}</SelectItem>
                <SelectItem value="rating">{t("garage.rating")}</SelectItem>
                <SelectItem value="name">{t("garage.name")}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={toggleSortDirection}>
              <ArrowUpDown className={cn("h-4 w-4", sortDirection === "desc" && "rotate-180")} />
            </Button>
          </div>
        </div>
      </div>

      {filteredGarages.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <p>{t("garage.no_results")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGarages.map((garage) => (
            <Card key={garage.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{garage.name}</CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {garage.address} • {formatDistance(garage.distance)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex flex-wrap gap-1 mb-2">
                  {garage.specializations.map((spec) => (
                    <Badge key={spec} variant="secondary" className="text-xs">
                      {t(`garage.specialization_${spec}`)}
                    </Badge>
                  ))}
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{garage.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{garage.openHours}</span>
                  </div>
                </div>
                <div className="mb-2">{renderRatingStars(garage.rating)}</div>
                <p className="text-sm text-muted-foreground">{garage.description}</p>
              </CardContent>
              <CardFooter className="pt-2">
                <Button className="w-full" onClick={() => onSelectGarage(garage)}>
                  {t("garage.select")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
