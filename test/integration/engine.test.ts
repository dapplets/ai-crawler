import { Engine } from '../../src/engine'
import { JsonStorage } from '../../src/storage/json-storage'
import { LocalStorage } from '../../src/storage/local-storage'
import { TextEncoder, TextDecoder } from 'util'

Object.assign(global, { TextDecoder, TextEncoder })

// ToDo: should we mock the social db contract?
// ToDo: reset jsdom state between tests
// ToDo: specify document.location explicitly. Now it's 'localhost' by default

describe('Engine', () => {
  let engine: Engine
  let i = 0

  beforeEach(() => {
    engine = new Engine({
      gatewayId: 'test',
      networkId: 'mainnet',
      selector: null as any,
      storage: new JsonStorage(new LocalStorage(`test-${++i}`)),
      bosElementName: `bos-component-${++i}`
    })
  })

  it('initializes engine', async () => {
    // Assert
    expect(engine.started).toEqual(false)
  })

  it('runs engine', async () => {
    // Act
    await engine.start()

    // Assert
    expect(engine.started).toEqual(true)
  })

  it('favorite mutation is not set by default', async () => {
    // Arrange
    const expected = null

    // Act
    const actual = await engine.getFavoriteMutation()

    // Assert
    expect(actual).toEqual(expected)
  });

  it('sets favorite mutation', async () => {
    // Arrange
    const mutationId = 'bos.dapplets.near/mutation/Sandbox'

    // Act
    await engine.setFavoriteMutation(mutationId)
    const actual = await engine.getFavoriteMutation()
    const mutations = await engine.getMutations()
    const mutation = mutations.find((mut) => mut.id === mutationId)

    // Assert
    expect(actual).toEqual(mutationId)
    expect(mutation!.settings.isFavorite).toEqual(true)
  })
})
