import { Card } from "@/design-system/ui";
import { cn } from "@/design-system/utils/cn";
import type { IHotel } from "@/entities/hotel/hotel.types";
import type { ReactElement } from "react";

interface IHotelListProps {
  hotels: IHotel[];
  selectedHotelId: string | null;
  onSelectHotel: (hotelId: string) => void;
}

function HotelRating({ rating }: { rating: number }): ReactElement {
  return (
    <span
      className="text-sm text-[var(--color-accent-dark,#a16207)]"
      aria-label={`${rating} estrelas`}
    >
      {"★".repeat(Math.round(rating))}
      <span className="text-zinc-300">
        {"★".repeat(Math.max(0, 5 - Math.round(rating)))}
      </span>
    </span>
  );
}

export function HotelList({
  hotels,
  selectedHotelId,
  onSelectHotel,
}: IHotelListProps): ReactElement {
  return (
    <ul className="flex max-h-[520px] flex-col gap-3 overflow-y-auto pr-1">
      {hotels.map((hotel: IHotel) => {
        const isSelected: boolean = hotel.id === selectedHotelId;

        return (
          <li key={hotel.id}>
            <Card
              padding="sm"
              hoverable
              className={cn(
                "cursor-pointer border-2 transition",
                isSelected
                  ? "border-[var(--color-primary)]"
                  : "border-transparent",
              )}
              onClick={() => onSelectHotel(hotel.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onSelectHotel(hotel.id);
                }
              }}
            >
              <h3 className="text-sm font-semibold text-zinc-900">
                {hotel.name}
              </h3>

              {hotel.address ? (
                <p className="mt-1 text-xs leading-5 text-zinc-600">
                  {hotel.address}
                </p>
              ) : null}

              <div className="mt-2 flex flex-wrap items-center gap-3">
                {hotel.rating ? <HotelRating rating={hotel.rating} /> : null}
                {hotel.phone ? (
                  <span className="text-xs text-zinc-500">{hotel.phone}</span>
                ) : null}
              </div>
            </Card>
          </li>
        );
      })}
    </ul>
  );
}
