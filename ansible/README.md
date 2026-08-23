# Ansible (archived)

Этот каталог сохранен только как история прежнего способа деплоя и **не
участвует** в текущем процессе публикации приложения.

Продакшен-версия раздается GitHub Pages
(`https://krasotun.github.io/messenger/`), деплой выполняется workflow
`.github/workflows/deploy.yml` через `actions/upload-pages-artifact` и
`actions/deploy-pages` - без SSH и без Ansible.

VDS, который эти playbook'и настраивали, выведен из эксплуатации, секреты
`VDS_SSH_PRIVATE_KEY`, `VDS_HOST`, `VDS_USER`, `VDS_WEB_ROOT` удалены из
репозитория. Воспроизвести описанный здесь сервер уже нечем, отката на
прежний хостинг нет.

Связанные архивные материалы: `docs/deployment/`.
