FROM public.ecr.aws/lambda/nodejs:16.2022.05.31.10

COPY / ${LAMBDA_TASK_ROOT}

CMD ["server/index.handler"]