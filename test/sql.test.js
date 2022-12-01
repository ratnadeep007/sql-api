const SQL = require('../src/sql');

describe("POSTGRES API Test", () => {
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

    test('delete with single clause', async () =>{
        await sql
            .delete('records')
            .where('age', '12', sql.conditionalEnums.GT)
            .execute();
        expect(sql.queryString).toBe("DELETE FROM records WHERE age > 12;");
    });

    test('delete with multiple clause (and)', async () =>{
        await sql
            .delete('records')
            .where('age', '12', sql.conditionalEnums.GT)
            .and()
            .where('age', '12', sql.conditionalEnums.LT)
            .execute();
        expect(sql.queryString).toBe("DELETE FROM records WHERE age > 12 AND age < 12;");
    });

    test('delete with multiple clause (and)', async () =>{
        await sql
            .delete('records')
            .where('age', '12', sql.conditionalEnums.GT)
            .or()
            .where('age', '12', sql.conditionalEnums.LT)
            .execute();
        expect(sql.queryString).toBe("DELETE FROM records WHERE age > 12 OR age < 12;");
    });

    test('delete with return all', async () =>{
        await sql
            .delete('records')
            .where('age', '12', sql.conditionalEnums.GT)
            .or()
            .where('age', '12', sql.conditionalEnums.LT)
            .returns(['*'])
            .execute();
        expect(sql.queryString).toBe("DELETE FROM records WHERE age > 12 OR age < 12 RETURNING *;");
    });

    test('delete with return single column', async () =>{
        await sql
            .delete('records')
            .where('age', '12', sql.conditionalEnums.GT)
            .or()
            .where('age', '12', sql.conditionalEnums.LT)
            .returns(['email'])
            .execute();
        expect(sql.queryString).toBe("DELETE FROM records WHERE age > 12 OR age < 12 RETURNING email;");
    });

    test('delete with return multiple column', async () =>{
        await sql
            .delete('records')
            .where('age', '12', sql.conditionalEnums.GT)
            .or()
            .where('age', '12', sql.conditionalEnums.LT)
            .returns(['email', 'username'])
            .execute();
        expect(sql.queryString).toBe("DELETE FROM records WHERE age > 12 OR age < 12 RETURNING email,username;");
    });

    test('update single column without clause', async () => {
        await sql
            .update('records')
            .set('age', '12')
            .execute();
        expect(sql.queryString).toBe("UPDATE records SET age = '12';");
    });

    test('update single column with single clause', async () => {
        await sql
            .update('records')
            .set('age', '12')
            .where('email', 'ratnadeep', sql.conditionalEnums.EQ)
            .execute();
        expect(sql.queryString).toBe("UPDATE records SET age = '12' WHERE email = 'ratnadeep';");
    });

    test('update single column with multiple clause', async () => {
        await sql
            .update('records')
            .set('age', '12')
            .where('email', 'ratnadeep', sql.conditionalEnums.EQ)
            .and()
            .where('id', '12')
            .execute();
        expect(sql.queryString).toBe("UPDATE records SET age = '12' WHERE email = 'ratnadeep' AND id = 12;");
    });

    test('update multiple column without clause', async () => {
        await sql
            .update('records')
            .set('age', '12')
            .set('email', 'ratnadeep')
            .execute();
        expect(sql.queryString).toBe("UPDATE records SET age = '12', email = 'ratnadeep';");
    });

    test('update multiple column with single clause', async () => {
        await sql
            .update('records')
            .set('age', '12')
            .set('email', 'ratnadeep')
            .where('email', 'ratnadeep', sql.conditionalEnums.EQ)
            .execute();
        expect(sql.queryString).toBe("UPDATE records SET age = '12', email = 'ratnadeep' WHERE email = 'ratnadeep';");
    });

    test('update multiple column with multiple clause', async () => {
        await sql
            .update('records')
            .set('age', '12')
            .set('email', 'ratnadeep')
            .where('email', 'ratnadeep', sql.conditionalEnums.EQ)
            .and()
            .where('id', '12')
            .execute();
        expect(sql.queryString).toBe("UPDATE records SET age = '12', email = 'ratnadeep' WHERE email = 'ratnadeep' AND id = 12;");
    });

    test('update with all return', async () => {
        await sql
            .update('records')
            .set('age', '12')
            .set('email', 'ratnadeep')
            .where('email', 'ratnadeep', sql.conditionalEnums.EQ)
            .and()
            .where('id', '12')
            .returns(['*'])
            .execute();
        expect(sql.queryString).toBe("UPDATE records SET age = '12', email = 'ratnadeep' WHERE email = 'ratnadeep' AND id = 12 RETURNING *;");
    });

    test('update with single column return', async () => {
        await sql
            .update('records')
            .set('age', '12')
            .set('email', 'ratnadeep')
            .where('email', 'ratnadeep', sql.conditionalEnums.EQ)
            .and()
            .where('id', '12')
            .returns(['username'])
            .execute();
        expect(sql.queryString).toBe("UPDATE records SET age = '12', email = 'ratnadeep' WHERE email = 'ratnadeep' AND id = 12 RETURNING username;");
    });

    test('update with multiple column return', async () => {
        await sql
            .update('records')
            .set('age', '12')
            .set('email', 'ratnadeep')
            .where('email', 'ratnadeep', sql.conditionalEnums.EQ)
            .and()
            .where('id', '12')
            .returns(['username', 'email'])
            .execute();
        expect(sql.queryString).toBe("UPDATE records SET age = '12', email = 'ratnadeep' WHERE email = 'ratnadeep' AND id = 12 RETURNING username,email;");
    });
})