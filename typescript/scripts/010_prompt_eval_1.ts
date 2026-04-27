const getPrompt = (task: string) => {
  `Please provide a solution to the following task:\n${task}`
}

const tasks = [
  {
    task: "Create a python function to extract the AWS account ID from ARN"
  },
  {
    task: "Write a JSON policy document that allows read-only access to a specific S3 bucket"
  },
  {
    task: "Provide a regex for validating an AWS iam"
  },
  {
    task: "Provide a CLI command to trigger a elastic AWS container to be redeployed"
  }
]