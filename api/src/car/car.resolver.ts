import { Resolver, Query, Mutation, Args, Int } from "@nestjs/graphql";
import { CarService } from "./car.service";
import { Car } from "./entities/car.entity";
import { CreateCarInput } from "./dto/create-car.input";
import { UpdateCarInput } from "./dto/update-car.input";
import { UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "src/auth/jwt-auth.guard";

@Resolver(() => Car)
export class CarResolver {
  constructor(private readonly carService: CarService) {}

  @Mutation(() => Car)
  @UseGuards(JwtAuthGuard)
  async createCar(
    @Args("createCarInput") createCarInput: CreateCarInput,
  ): Promise<Car> {
    return await this.carService.create(createCarInput);
  }

  @Query(() => [Car], { name: "cars" })
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.carService.findAll();
  }

  @Query(() => Car, { name: "car" })
  @UseGuards(JwtAuthGuard)
  findOne(@Args("id", { type: () => Int }) id: number) {
    return this.carService.findOne(id);
  }

  @Mutation(() => Car)
  @UseGuards(JwtAuthGuard)
  updateCar(@Args("updateCarInput") updateCarInput: UpdateCarInput) {
    return this.carService.update(updateCarInput.id, updateCarInput);
  }

  @Mutation(() => Car)
  @UseGuards(JwtAuthGuard)
  removeCar(@Args("id", { type: () => Int }) id: number) {
    return this.carService.remove(id);
  }
}