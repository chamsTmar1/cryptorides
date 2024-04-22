import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { CarFilter } from "./dto/car.filter";
import { InjectRepository } from "@nestjs/typeorm";
import { Car } from "../car/entities/car.entity";
import { LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { Rentalcar } from "./entities/rentalcar.entity";
import { CreateRentalcarInput } from "./dto/create-rentalcar.input";
import { CarService } from "../car/car.service";

@Injectable()
export class RentalCarService {
  constructor(
    @InjectRepository(Car)
    private readonly carrepository: Repository<Car>,
    @InjectRepository(Rentalcar)
    private readonly rentalcarRepository: Repository<Rentalcar>,
    private readonly carService: CarService,
  ) {}

  async create(input: CreateRentalcarInput): Promise<Rentalcar> {
    try {
      const { carId, reservedfrom, reservedto } = input;
      // Vérifier si la voiture existe
      const car = await this.carService.findOneById(carId);
      if (!car) {
        throw new NotFoundException(`Car with ID ${carId} not found`);
      }
      // Vérifier si la date de début est antérieure à la date de fin
      if (reservedfrom >= reservedto) {
        throw new BadRequestException(
          "The start date must be before the end date",
        );
      }
      // Vérifier si la voiture est déjà réservée pour la période spécifiée
      const existingReservations = await this.rentalcarRepository.find({
        where: {
          car: { id: carId },
          reservedfrom: LessThanOrEqual(reservedto),
          reservedto: MoreThanOrEqual(reservedfrom),
        },
      });
      if (existingReservations.length > 0) {
        throw new ConflictException(
          `Car with ID ${carId} is already reserved for the specified period`,
        );
      }
      const rentalcar = this.rentalcarRepository.create({
        reservedfrom,
        reservedto,
        car,
      });
      return this.rentalcarRepository.save(rentalcar);
    } catch (error) {
      throw error;
    }
  }

  async findRentalHistoryByCarId(carId: number): Promise<Rentalcar[]> {
    try {
      // Vérifier si la voiture existe
      const car = await this.carService.findOneById(carId);
      if (!car) {
        throw new NotFoundException(`Car with ID ${carId} not found`);
      }
      // Recherche de l'historique de location pour la voiture spécifiée
      const rentalHistory = await this.rentalcarRepository.find({
        where: { car: { id: carId } },
      });
      if (rentalHistory.length === 0) {
        throw new NotFoundException(
          `No rental history found for car with ID ${carId}`,
        );
      }
      return rentalHistory;
    } catch (error) {
      throw error;
    }
  }
  async deleteRentalcarByCarId(carId: number): Promise<void> {
    try {
      const car = await this.carService.findOneById(carId);
      if (!car) {
        throw new NotFoundException(`Car with ID ${carId} not found`);
      }
      const rentalcar = await this.rentalcarRepository.find({
        where: { car: { id: carId } },
      });
      if (rentalcar.length === 0) {
        throw new NotFoundException(`Car with ID ${carId} is not rented yet`);
      }
      await this.rentalcarRepository.delete({ car: { id: carId } });
    } catch (error) {
      throw error;
    }
  }

  async filterCars(filter: CarFilter): Promise<Car[]> {
    let query = this.carrepository.createQueryBuilder("car");

    if (filter.minPrice) {
      query = query.andWhere("car.rentalPrice >= :minPrice", {
        minPrice: filter.minPrice,
      });
    }

    if (filter.maxPrice) {
      query = query.andWhere("car.rentalPrice <= :maxPrice", {
        maxPrice: filter.maxPrice,
      });
    }

    if (filter.minDownPayment) {
      query = query.andWhere("car.downPayment >= :minDownPayment", {
        minDownPayment: filter.minDownPayment,
      });
    }

    if (filter.maxDownPayment) {
      query = query.andWhere("car.downPayment <= :maxDownPayment", {
        maxDownPayment: filter.maxDownPayment,
      });
    }

    // Filtrer les voitures déjà réservées pour la période spécifiée
    if (filter.availabilityFrom && filter.availabilityTo) {
      const reservedCarIds = await this.rentalcarRepository
        .createQueryBuilder("rentalcar")
        .select("DISTINCT rentalcar.carId")
        .where(
          "((:availabilityFrom BETWEEN rentalcar.reservedfrom AND rentalcar.reservedto) OR " +
            "(:availabilityTo BETWEEN rentalcar.reservedfrom AND rentalcar.reservedto) OR " +
            "(rentalcar.reservedfrom BETWEEN :availabilityFrom AND :availabilityTo) OR " +
            "(rentalcar.reservedto BETWEEN :availabilityFrom AND :availabilityTo))",
          {
            availabilityFrom: filter.availabilityFrom,
            availabilityTo: filter.availabilityTo,
          },
        )
        .getRawMany();

      if (reservedCarIds.length > 0) {
        const reservedCarIdList = reservedCarIds.map((item) => item.carId);
        query = query.andWhere("car.id NOT IN (:...reservedCarIdList)", {
          reservedCarIdList,
        });
      }
    }

    return query.getMany();
  }

  async searchCars(searchInput: string): Promise<Car[]> {
    const searchKeywords = searchInput.trim().toLowerCase().split(" ");

    const query = this.carrepository.createQueryBuilder("car");
    let searchQuery = query;

    for (const keyword of searchKeywords) {
      searchQuery = searchQuery
        .orWhere("LOWER(car.brand) LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("LOWER(car.color) LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("LOWER(car.location) LIKE :keyword", {
          keyword: `%${keyword}%`,
        })
        .orWhere("LOWER(car.title) LIKE :keyword", { keyword: `%${keyword}%` })
        .orWhere("LOWER(car.fuelType) LIKE :keyword", {
          keyword: `%${keyword}%`,
        });
    }

    const results = await searchQuery.getMany();
    return results;
  }
}