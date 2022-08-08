class ChangeEvent extends Event {
  /**
   * @param {string} path
   * @param {File} file
   */
  constructor (path, file) {
    super('change')
    this.path = path
    this.file = file
  }
}

export default class Store extends Map {
  /** @type {{File: typeof File, fileFromSync}|null} */
  static fs = null

  constructor (items) {
    super(items)

    const evt = new EventTarget()
    this.addEventListener = evt.addEventListener.bind(evt)
    this.dispatchEvent = evt.dispatchEvent.bind(evt)
    this.removeEventListener = evt.removeEventListener.bind(evt)
  }

  /**
   * @param {string} filepath
   * @return {File}
   */
  #load (filepath) {
    try {
      this.set(filepath, Store.fs.fileFromSync(filepath))
    } catch (err) {
      const File = Store.fs?.File || globalThis.File
      this.set(filepath, new File([], filepath))
    }

    return this.get(filepath)
  }

  /** @param {string} filepath */
  get (filepath) {
    return super.get(filepath) || this.#load(filepath)
  }

  set (path, file) {
    super.set(path, file)
    const evt = new ChangeEvent(path, file)
    this.dispatchEvent(evt)
    return this
  }
}
