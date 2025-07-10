import { all } from "axios"
import { db } from "../libs/db.js"
import { submitBatch, pollBatchResults, getlanguagename } from "../libs/judge0.lib.js"

export const executeCode = async (req, res) => {
    try {
        console.log("hello")
        const {source_code, language_id, stdin, expected_outputs, problemId} = req.body

        const userId = req.user.id
        console.log("hello2")

        // validate test cases

        if(!Array.isArray(stdin) || stdin.length === 0 || !Array.isArray(expected_outputs) || expected_outputs.length !== stdin.length){
            return res.status(400).json({error: "Invalid or missing test cases.",
                stdin_len: stdin.length,
                expected_outputs_len: expected_outputs.length
            })
        }

        const submissions = stdin.map((input) => ({source_code, language_id, stdin: input}))

        const submitResponse = await submitBatch(submissions)

        const tokens = submitResponse.map((res) => res.token)

        const results = await pollBatchResults(tokens)

        console.log("results---------------\n ", results)

        let allPassed = true
        const detailResults = results.map((result, i) => {
            const stdout = result.stdout?.trim()
            const expected_output = expected_outputs[i]?.trim()
            const passed = stdout === expected_output

            if(!passed) allPassed = false;

            return {
                testCase: i+1,
                passed,
                stdout,
                expected: expected_output,
                stderr: result.stderr || null,
                compiledOutput: result.compile_output || null,
                status: result.status.description,
                memory: result.memory ? `${result.memory}` : undefined,
                time: result.time ? `${result.time}s` : undefined
            }

            // console.log(`Testcase #${i+1}`)
            // console.log(`Input: ${stdin[i]}`)
            // console.log(`Expected output for the testcase: ${expected_output}`)
            // console.log(`Actual output: ${stdout}`)
            // console.log(`Matched: ${passed}\n\n\n`)
        })

        console.log(detailResults)

        const submission = await db.submission.create({
            data: {
                userId,
                problemId,
                sourceCode: source_code,
                language:getlanguagename(language_id),
                stdin: stdin.join("\n"),
                stdout: JSON.stringify(detailResults.map((r) => r.stdout)),
                stderr: detailResults.some((r) => r.stderr) ? JSON.stringify(detailResults.map((r) => r.stderr)) : null,
                compileOutput: detailResults.some((r) => r.compiledOutput) ? JSON.stringify(detailResults.map((r) => r.compiledOutput)) : null,
                status: allPassed ? "Accepted" : "Wrong Answer",
                memory: detailResults.some((r) => r.memory) ? JSON.stringify(detailResults.map((r) => r.memory)) : null,
                time: detailResults.some((r) => r.time) ? JSON.stringify(detailResults.map((r) => r.time)) : null,
            }
        })

        if(allPassed){
            await db.problemSolved.upsert({
                where: {
                    userId_problemId: {
                        userId,
                        problemId
                    }
                },
                update: {},
                create: {
                    userId,
                    problemId
                }
            })
        }

        const testCaseResults = detailResults.map((result) => ({
            submissionId: submission.id,
            testCase: JSON.stringify(result.testCase),
            passed: result.passed,
            stdout: result.stdout,
            expected: result.expected,
            stderr: result.stderr,
            compiledOutput: result.compiledOutput,
            status: result.status,
            memory: result.memory,
            time: result.time
        }))

        await db.testCaseResult.createMany({
            data: testCaseResults
        })

        const submissionWithTestCase = await db.submission.findUnique({
            where: {
                id: submission.id
            },
            include: {
                testcases: true
            }
        })

        res.status(200).json({success: true, message: "Code executed successfully", submission: submissionWithTestCase})


    } catch (error) {
        console.log(error)
        res.status(500).json({success: false, message: "Something went wrong while executing code", error})
    }
}