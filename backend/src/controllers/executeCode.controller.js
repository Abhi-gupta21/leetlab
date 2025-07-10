import { submitBatch, pollBatchResults } from "../libs/judge0.lib.js"

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

        res.status(200).json({success: true, message: "Code executed successfully", results})


    } catch (error) {
        
    }
}