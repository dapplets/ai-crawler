import { AnyParserValue } from '../application/application.entity'
import { ApplicationDto } from '../application/dtos/application.dto'
import { IRepository } from '../base/repository.interface'
import { ParserConfig, ParserConfigId } from './parser-config.entity'

export class ParserConfigService {
  constructor(private parserConfigRepository: IRepository<ParserConfig>) {}

  public async getParserConfig(parserId: ParserConfigId): Promise<ParserConfig | null> {
    if (parserId === 'mweb') return null
    if (parserId === 'engine') return null

    return this.parserConfigRepository.getItem({ id: parserId })
  }

  public async getAllParserConfigs(): Promise<ParserConfig[]> {
    return this.parserConfigRepository.getItems()
  }

  public async getParserConfigsForApps(apps: ApplicationDto[]): Promise<ParserConfig[]> {
    const namespaces = new Set<ParserConfigId>()

    for (const app of apps) {
      if (!app.parsers) {
        app.targets.forEach((target) => namespaces.add(target.namespace))
      } else if (app.parsers === AnyParserValue) {
        return this.getAllParserConfigs() // returns all parsers and breaks the loop!
      } else {
        app.parsers.forEach((parserGlobalId) => namespaces.add(parserGlobalId))
      }
    }

    // ToDo: catch errors
    const parserConfigs = await Promise.all(
      Array.from(namespaces).map((ns) => this.getParserConfig(ns))
    )

    return parserConfigs.filter((pc) => pc !== null)
  }
}
