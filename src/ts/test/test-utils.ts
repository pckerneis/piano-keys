export class TestUtils<T extends Element> {
  /**
   * Renders a given element with provided attributes
   * and returns a promise which resolves as soon as
   * rendered element becomes available.
   * @param {string} tag
   * @param {object} attributes
   * @returns {Promise<HTMLElement>}
   */
  render(tag: string, attributes: any = {}): Promise<T> {
    this._renderToDocument(tag, attributes);
    return this._waitForComponentToRender<T>(tag);
  }

  /**
   * Replaces document's body with provided element
   * including given attributes.
   * @param {string} tag
   * @param {object} attributes
   */
  _renderToDocument(tag: string, attributes: any = {}): any {
    const htmlAttributes = this._mapObjectToHTMLAttributes(attributes);
    document.body.innerHTML = `<${tag} ${htmlAttributes}></${tag}>`;
  }

  /**
   * Converts an object to HTML string representation of attributes.
   *
   * For example: `{ foo: "bar", baz: "foo" }`
   * becomes `foo="bar" baz="foo"`
   *
   * @param {object} attributes
   * @returns {string}
   */
  _mapObjectToHTMLAttributes(attributes: any) {
    return Object.entries(attributes).reduce((previous, current) => {
      return previous + ` ${current[0]}="${current[1]}"`;
    }, "");
  }

  /**
   * Returns a promise which resolves as soon as
   * requested element becomes available.
   * @param {string} tag
   * @returns {Promise<HTMLElement>}
   */
  async _waitForComponentToRender<T extends Element>(tag: string): Promise<T> {
    return new Promise(resolve => {
      function requestComponent() {
        const element = document.querySelector(tag);
        if (element) {
          resolve(element as T);
        } else {
          window.requestAnimationFrame(requestComponent);
        }
      }
      requestComponent();
    });
  }
}