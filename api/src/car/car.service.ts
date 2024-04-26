import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateCarInput } from "./dto/create-car.input";
import { UpdateCarInput } from "./dto/update-car.input";
import { InjectRepository } from "@nestjs/typeorm";
import { Car } from "./entities/car.entity";
import { Repository } from "typeorm";
import { UsersService } from "src/users/users.service";
import { User } from "src/shared/entities/user.entity";
import { jwtDecode } from "jwt-decode";
import { Request } from 'express';

@Injectable()
export class CarService {
  constructor(
    @InjectRepository(Car)
    private readonly carRepository: Repository<Car>,
    private readonly usersService: UsersService,
  
  ) {}

  async create(createCarInput: CreateCarInput): Promise<Car> {
    try {
      const { ownerId, ...carData } = createCarInput;
      const owner = await this.usersService.findOneById(ownerId);
      if (!owner) {
        throw new NotFoundException(`Owner with ID ${ownerId} not found`);
      }

      const car = this.carRepository.create({
        ...carData,
        owner,
      });

      return this.carRepository.save(car);
    } catch (error) {
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.carRepository.find({ where: {}, relations: ["owner"] });
    } catch (error) {
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      const car = await this.carRepository.findOne({
        where: { id },
        relations: ["owner"],
      });
      if (!car) {
        throw new NotFoundException(`Car with ID ${id} not found`);
      }

      return car;
    } catch (error) {
      throw error;
    }
  }
  async findOneById(id: number): Promise<Car | null> {
    try {
      const car = await this.carRepository.findOneBy({ id });
      return car;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async findAllById(id: number): Promise<Car[] | null> {
    try {
      const cars = await this.carRepository.find({
        where: { owner: { id: id } },
        relations: ["owner"]
      });
      console.log(cars) ;
      return cars ;
    } catch (error) {
      console.error(error);
      return null;
    }
  }
  async idFromRequest(request: Request): Promise <null | number>  {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    if (!(type === 'Bearer') ){
        return null ; 
    }else{
        const payload = jwtDecode(token) ;
        const id = parseInt(payload.sub) ; 
        return id ; 
    }
  }
  async findAllCarsById(id : number) : Promise< Car[] | null>{
    return this.findAllById(id) ; 
  }


  async update(id: number, updateCarInput: UpdateCarInput) {
    try {
      const carToUpdate = await this.findOne(id);
      if (!carToUpdate) {
        throw new NotFoundException(`Car with ID ${id} not found`);
      }

      await this.carRepository.update(id, updateCarInput);

      const updatedCar = await this.carRepository.findOne({
        where: { id },
        relations: ["owner"],
      });

      return updatedCar;
    } catch (error) {
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const carToRemove = await this.carRepository.findOne({
        where: { id },
        relations: ["owner"],
      });
      if (!carToRemove) {
        throw new NotFoundException(`Car with ID ${id} not found`);
      }

      await this.carRepository.delete(id);

      return carToRemove;
    } catch (error) {
      throw error;
    }
  }
}
