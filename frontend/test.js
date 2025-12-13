const example = "https://www.youtube.com/watch?v=GuHN_ZqHExs";

const firstSplit = example.split("//")[1].trim().split("/")[0].trim()
// const secondSplit = firstSplit.split("/")[0]
console.log(firstSplit)