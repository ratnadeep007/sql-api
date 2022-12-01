const SQL = require('../src/sql');

describe("SQL API Test", () => {
    let sql;

    beforeEach(() => {
        sql = new SQL();
        sql.connect = jest.fn().mockReturnThis();
        sql.client.query = jest.fn().mockReturnThis();
    });

    test('select statement with not conditon', async () =>{
        await sql
            .select(['username', 'email'])
            .from('records')
            .where('email', 'test1@example.com', sql.conditionalEnums.NE)
            .paginate(10, 0)
            .execute();
        expect(sql.queryString).toBe("SELECT username, email FROM records WHERE email <> 'test1@example.com' OFFSET 0 LIMIT 10;");
    });

    test('select statement with where clause and number', async () =>{
        await sql
            .select(['username', 'email'])
            .from('records')
            .where('age', '12', sql.conditionalEnums.NE)
            .paginate(10, 0)
            .execute();
        expect(sql.queryString).toBe("SELECT username, email FROM records WHERE age <> 12 OFFSET 0 LIMIT 10;");
    });

    test('select statement with multiple or conditions', async () =>{
        await sql
            .select(['username', 'email'])
            .from('records')
            .where('email', 'test1@example.com', sql.conditionalEnums.NE)
            .or()
            .where('age', '30', sql.conditionalEnums.GE)
            .paginate(10, 0)
            .execute();
        expect(sql.queryString).toBe("SELECT username, email FROM records WHERE email <> 'test1@example.com' OR age >= 30 OFFSET 0 LIMIT 10;");
    });

    test('select statement with multiple and conditions', async () =>{
        await sql
            .select(['username', 'email'])
            .from('records')
            .where('email', 'test1@example.com', sql.conditionalEnums.NE)
            .and()
            .where('age', '30', sql.conditionalEnums.GE)
            .paginate(10, 0)
            .execute();
        expect(sql.queryString).toBe("SELECT username, email FROM records WHERE email <> 'test1@example.com' AND age >= 30 OFFSET 0 LIMIT 10;");
    });

    test('select statement no condition', async () =>{
        await sql
            .select(['username', 'email'])
            .from('records')
            .paginate(10, 0)
            .execute();
        expect(sql.queryString).toBe("SELECT username, email FROM records OFFSET 0 LIMIT 10;");
    });

    test('insert statement with single column return', async () =>{
        await sql
            .insert('records', ['username', 'email'])
            .values(['test4', 'test11@example.com'])
            .returns(['username'])
            .execute();
        expect(sql.queryString).toBe("INSERT INTO records (username,email) VALUES ('test4','test11@example.com') RETURNING username;");
    });

    test('insert statement with multiple column return', async () =>{
        await sql
            .insert('records', ['username', 'email'])
            .values(['test4', 'test11@example.com'])
            .returns(['username', 'email'])
            .execute();
        expect(sql.queryString).toBe("INSERT INTO records (username,email) VALUES ('test4','test11@example.com') RETURNING username,email;");
    });

    test('insert statement with multiple column return', async () =>{
        await sql
            .insert('records', ['username', 'email'])
            .values(['test4', 'test11@example.com'])
            .returns(['*'])
            .execute();
        expect(sql.queryString).toBe("INSERT INTO records (username,email) VALUES ('test4','test11@example.com') RETURNING *;");
    });

    test('insert statement with no return', async () =>{
        await sql
            .insert('records', ['username', 'email'])
            .values(['test4', 'test11@example.com'])
            .execute();
        expect(sql.queryString).toBe("INSERT INTO records (username,email) VALUES ('test4','test11@example.com');");
    });

    test('insert statement with number', async () =>{
        await sql
            .insert('records', ['username', 'email', 'age'])
            .values(['test4', 'test11@example.com', '12'])
            .returns(['*'])
            .execute();
        expect(sql.queryString).toBe("INSERT INTO records (username,email,age) VALUES ('test4','test11@example.com','12') RETURNING *;");
    });
})