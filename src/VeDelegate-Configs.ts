import { ConfigUpdated as ConfigUpdatedEvent } from '../generated/vedelegate-configs/IVeDelegateConfigs'
import { fetchAccount } from '../node_modules/@openzeppelin/subgraphs/src/fetch/account'
import { VeDelegateConfig } from '../generated/schema';

export function handleConfigUpdated(event: ConfigUpdatedEvent): void {
    let sender = fetchAccount(event.params.sender)
    const id = [sender.id.toHexString(), event.params.configId.toHexString()].join('/')
    let config = VeDelegateConfig.load(id)
    if (!config) {
        config = new VeDelegateConfig(id)
        config.account = sender.id
    }

    config.configId = event.params.configId.toHexString()
    config.value = event.params.value
    config.save()
}