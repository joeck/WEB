
const p1 = require("../praktikum01")

describe("Testing for Tag Finder", () => {
    it("Should find header Tag", () => {
        expect(p1.findTag("<header>Text</header")).toBe("header");
    })

    it("Should find header Tag", () => {
        expect(p1.findTag("blabla <br> blabla")).toBe("br");
    })
})