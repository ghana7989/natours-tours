class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString
    }
    filter() {
        let queryObj = { ...this.queryString }

        const excludeFields = ["page", "sort", "limit", "fields"]
        excludeFields.forEach(el => delete queryObj[el])

        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`)
        queryObj = JSON.parse(queryStr)

        this.query = this.query.find(queryObj)

        return this
    }
    sort() {
        if (this.queryString.sort) {
            const sortBy = this.queryString.sort.split(",").join(" ")
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort("-ratingsAverage")
        }
        return this

    }
    limitFields() {
        // This is also called projecting   
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(",").join(" ");
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select("-__v")
        }
        return this
    }
    paginate() {
        const page = +this.queryString.page || 1;
        const limit = +this.queryString.limit || 100;
        const skipValue = (page - 1) * limit
        this.query = this.query.skip(skipValue).limit(limit)
        return this
    }

}
module.exports = APIFeatures