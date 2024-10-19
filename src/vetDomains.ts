import {
    AddrChanged as AddrChangedEvent,
    NameChanged as NameChangedEvent,
} from "../generated/vetDomains/Resolver";
import { ResolveUtils } from '../generated/vetDomains/ResolveUtils'
import { Account, VetDomainsNames } from '../generated/schema'
import { Address, Bytes } from '@graphprotocol/graph-ts'
import { constants } from '@amxx/graphprotocol-utils'


// Addresses are documented on https://docs.vet.domains/Developers/Contracts/
const RESOLVE_UTILS_ADDRESS = Address.fromString('0xA11413086e163e41901bb81fdc5617c975Fa5a1A')

/**
 * when a reverse name is set, update the matching account if the lookup is complete
 */
export function handleNameChanged(event: NameChangedEvent): void {
    // load confirmed address for the name
    const resolveUtils = ResolveUtils.bind(RESOLVE_UTILS_ADDRESS)
    const addresses = resolveUtils.try_getAddresses([event.params.name])

    if (addresses.reverted || addresses.value.length == 0) { return }
    linkNameAddress(addresses.value[0], event.params.name)
}

/**
 * when a reverse name is set, update the matching account if the lookup is complete
 */
export function handleAddrChanged(event: AddrChangedEvent): void {
    // load confirmed name for the address
    const resolveUtils = ResolveUtils.bind(RESOLVE_UTILS_ADDRESS)
    const names = resolveUtils.try_getNames([Address.fromBytes(event.params.newAddress)])

    if (names.reverted || names.value.length == 0) { return }
    linkNameAddress(event.params.newAddress, names.value[0])

}

function linkNameAddress(address: Address, name: string): void {
    const domainName = fetchName(name)

    // reset previous name for address
    const oldOwner = fetchAccount(Address.fromBytes(domainName.address))
    oldOwner.name = ''
    oldOwner.save()

    // reset previous owner for name
    domainName.address = constants.ADDRESS_ZERO
    domainName.save()

    // set new assignment for owner
    const newOwner = fetchAccount(address)
    newOwner.name = name
    newOwner.save()

    // set new assignment for name
    domainName.address = address
    domainName.save()
}

function fetchAccount(address: Address): Account {
    const account = new Account(address)
    account.save()

    return account
}


function fetchName(name: string): VetDomainsNames {
    let domainsName = VetDomainsNames.load(name)

    if (domainsName == null) {
        domainsName = new VetDomainsNames(name)
        domainsName.address = constants.ADDRESS_ZERO
        domainsName.save()
    }

    return domainsName
}