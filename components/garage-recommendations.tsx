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
import { useAuth } from "@/lib/auth-provider"
import { Garage } from "@/lib/types/claims"
import { useToast } from "./ui/use-toast"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible"

const API_URL = process.env.NEXT_PUBLIC_APP_API_URL;
// Mock data for garages

type Specialization = "bodywork" | "mechanical" | "electrical" | "painting" | "diagnostics"
type SortOption = "distance" | "rating" | "name"

interface GarageRecommendationsProps {
  onSelectGarage: (garage: Garage) => void
}
interface locationdata { latitude: number, longitude: number }
export function GarageRecommendations({ onSelectGarage }: GarageRecommendationsProps) {
  const { user, apiRequest } = useAuth()
  const { toast } = useToast();
  const { t } = useLanguage()
  const [garages, setGarages] = useState<Garage[]>([])
  const [filteredGarages, setFilteredGarages] = useState<Garage[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSpecializations, setSelectedSpecializations] = useState<Specialization[]>([])
  const [maxDistance, setMaxDistance] = useState<number>(10) // in km
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<SortOption>("distance")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [isLoading, setIsLoading] = useState(true);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [userLocation, setUserLocation] = useState<locationdata>();
  // Fetch location
  useEffect(() => {
    if (user?.tenant_id) {
      handleGeolocate();
    }
  }, [user]);
  // Fetch garages
  useEffect(() => {
    const fetchGarages = async () => {
      setIsLoading(true);
      try {
        if (userLocation) {
          // Fetch garages near user location
          const response = await apiRequest(
            `${API_URL}garages-by-location/${user.tenant_id}?latitude=${encodeURIComponent(userLocation.latitude)}&longitude=${encodeURIComponent(userLocation.longitude)}`,
            "GET"
          );
          setGarages(
            response.map((garage: Garage) => ({
              ...garage,
              rating: garage.rating !== null ? Number(garage.rating) : null,
              latitude: garage.latitude !== null ? Number(garage.latitude) : null,
              longitude: garage.longitude !== null ? Number(garage.longitude) : null,
              distance: garage.distance !== null && garage.distance !== undefined ? Number(garage.distance) : null,
            }))
          );
        } else {
          // Fetch all garages as fallback
          const response = await apiRequest(`${API_URL}garages-getall/${user.tenant_id}`, "GET");
          setGarages(
            response.map((garage: Garage) => ({
              ...garage,
              rating: garage.rating !== null ? Number(garage.rating) : null,
              latitude: garage.latitude !== null ? Number(garage.latitude) : null,
              longitude: garage.longitude !== null ? Number(garage.longitude) : null,
              distance: garage.distance !== null && garage.distance !== undefined ? Number(garage.distance) : null,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching garages:", error);
        toast({
          title: "Error Loading Garages",
          description: "Failed to load garages. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.tenant_id) {
      fetchGarages();
    }
  }, [user, userLocation, toast]); // Dependencies: user, userLocation, toast

  const handleGeolocate = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation Unavailable",
        description: "Your browser does not support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude })
        toast({
          title: "Location Acquired",
          description: "Current location is lat: " + userLocation?.latitude + " , long: " + userLocation?.longitude,
        });
        setIsGeolocating(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        toast({
          title: "Geolocation Error",
          description: "Failed to get current location",
          variant: "destructive",
        });
        setIsGeolocating(false);
      }
    );
  };
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
          garage.description?.toLowerCase().includes(query),
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

  // Helper function to format specialization for display
  const formatSpecializationtoarray = (spec: any): string[] => {
    const spex = JSON.stringify(spec)
    const sp = spex.split(',')
    return sp
  };
  const formatSpecialization = (spec: any) => {
    return spec.replace(/^"|"$/g, '').replace(/\\"/g, '').replace(/-/g, " ")
      .replace("[", "")
      .replace("]", "")
      .replace("\\", "")
      .replace(/\b\w/g, (char: string) => char.toUpperCase());
  };

  // Helper function to parse openHours
  const parseOpenHours = (openHours: string | null): { [key: string]: string } | null => {
    if (!openHours) return null;
    try {
      // Clean JSON string
      const cleaned = openHours.replace(/^"|"$/g, '').replace(/\\"/g, '"');
      return JSON.parse(cleaned);
    } catch (error) {
      console.warn("Failed to parse openHours as JSON:", openHours, error);
      return null;
    }
  };
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
                  {garage.address} • {formatDistance(garage.distance ?? 0)}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                {garage.specializations !== null && garage.specializations !== undefined ? (
                  <div className="specializations flex flex-wrap gap-2 mt-2">
                    {formatSpecializationtoarray(garage.specializations).map(ss => (
                      <Badge>{formatSpecialization(ss)}</Badge>
                    ))}
                  </div>) : ''}
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{garage.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">

                    <div className="open-hours mt-2">
                      {/* Open Hours */}
                      <Collapsible className="mt-2">
                        <CollapsibleTrigger className="text-sm font-medium text-blue-600 hover:underline flex">
                          <Clock className="h-4 w-4" />  Operating Hours
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <ul className="list-disc pl-5 text-sm mt-1">
                            {(() => {
                              const hours = parseOpenHours(garage.openHours);
                              if (!hours) {
                                return <p className="text-gray-500">No hours available</p>;
                              }
                              return Object.entries(hours).map(([day, hours]) => (
                                <li key={day}>
                                  {day.charAt(0).toUpperCase() + day.slice(1)}: {hours}
                                </li>
                              ));
                            })()}
                          </ul>
                        </CollapsibleContent>
                      </Collapsible>
                    </div>
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
