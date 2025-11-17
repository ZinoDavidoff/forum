import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TreeRepository } from "typeorm";
import { Category } from "./category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private categoriesRepository: TreeRepository<Category>
  ) {}

  async findAll() {
    const categories = await this.categoriesRepository.findTrees();
    return categories;
  }

  async findOne(id: string) {
    const category = await this.categoriesRepository.findOne({
      where: { id },
      relations: ["parent", "children"],
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const category = this.categoriesRepository.create(createCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    Object.assign(category, updateCategoryDto);
    return await this.categoriesRepository.save(category);
  }

  async remove(id: string) {
    const category = await this.findOne(id);
    await this.categoriesRepository.remove(category);
    return { message: "Category deleted successfully" };
  }

  async incrementThreadCount(categoryId: string) {
    await this.categoriesRepository.increment(
      { id: categoryId },
      "threadCount",
      1
    );
  }

  async incrementPostCount(categoryId: string) {
    await this.categoriesRepository.increment(
      { id: categoryId },
      "postCount",
      1
    );
  }
}
