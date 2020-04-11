import { PianoKeys } from "../index";
import { TestUtils } from "./test-utils";

describe("Piano Keys", () => {
  const testUtils = new TestUtils<PianoKeys>();

  it("should instantiate", async () => {
    const pianoKeys = await testUtils.render(PianoKeys.tag);
    expect(pianoKeys).toBeTruthy();
    expect(pianoKeys["_shadowRoot"]).toBeTruthy();
  });

  it("should recognize black keys", () => {
    expect(PianoKeys.isBlackKey(13)).toEqual(true);
    expect(PianoKeys.isBlackKey(26)).toEqual(false);
    expect(PianoKeys.isBlackKey(39)).toEqual(true);
    expect(PianoKeys.isBlackKey(52)).toEqual(false);
    expect(PianoKeys.isBlackKey(65)).toEqual(false);
    expect(PianoKeys.isBlackKey(78)).toEqual(true);
    expect(PianoKeys.isBlackKey(91)).toEqual(false);
    expect(PianoKeys.isBlackKey(104)).toEqual(true);
    expect(PianoKeys.isBlackKey(117)).toEqual(false);
    expect(PianoKeys.isBlackKey(130)).toEqual(true);
    expect(PianoKeys.isBlackKey(143)).toEqual(false);
  });
});