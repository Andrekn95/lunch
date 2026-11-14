import { AutoFillWeekUseCase } from '../application/use-cases/AutoFillWeekUseCase'
import { DeleteDishUseCase } from '../application/use-cases/DeleteDishUseCase'
import { ImportDishesUseCase } from '../application/use-cases/ImportDishesUseCase'
import { ImportIngredientsUseCase } from '../application/use-cases/ImportIngredientsUseCase'
import { ImportMenuMatrixUseCase } from '../application/use-cases/ImportMenuMatrixUseCase'
import { SaveDishUseCase } from '../application/use-cases/SaveDishUseCase'
import { SetMenuCellUseCase } from '../application/use-cases/SetMenuCellUseCase'
import { LocalStorageDishRepository } from './repositories/LocalStorageDishRepository'
import { LocalStorageIngredientRepository } from './repositories/LocalStorageIngredientRepository'
import { LocalStorageMenuPlanRepository } from './repositories/LocalStorageMenuPlanRepository'

export const ingredientRepository = new LocalStorageIngredientRepository()
export const importIngredientsUseCase = new ImportIngredientsUseCase(
  ingredientRepository,
)

export const dishRepository = new LocalStorageDishRepository()
export const menuPlanRepository = new LocalStorageMenuPlanRepository()

export const saveDishUseCase = new SaveDishUseCase(dishRepository)
export const importDishesUseCase = new ImportDishesUseCase(dishRepository)
export const deleteDishUseCase = new DeleteDishUseCase(
  dishRepository,
  menuPlanRepository,
)
export const setMenuCellUseCase = new SetMenuCellUseCase(menuPlanRepository)
export const autoFillWeekUseCase = new AutoFillWeekUseCase(
  dishRepository,
  menuPlanRepository,
)
export const importMenuMatrixUseCase = new ImportMenuMatrixUseCase(
  dishRepository,
  menuPlanRepository,
)
