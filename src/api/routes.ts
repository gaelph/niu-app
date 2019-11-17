export default {
  //@ts-ignore
  Latest: () => `${process.env.API_URL}/latest`,
  //@ts-ignore
  List: ({ page = 1, pageSize = 100 }) => `${process.env.API_URL}/?page=${page}&pageSize=${pageSize}`
}