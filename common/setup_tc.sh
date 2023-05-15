#!/usr/bin/env bash

INTERFACE=`netstat -i | grep eth | cut -d" "  -f1`;
DELAY=""
BANDWIDTH=""
JITTER=""
RANDOM_LOSS_PERCENT=""
REORDER_PERCENT=""
TC=0

function setupTC () {
    delay_arg=""
    bandwidth_arg=""
    random_loss_arg=""
    reorder_arg=""
    if [ "$DELAY" != "" ]; then
        delay_arg="delay $DELAY $JITTER"
    fi
    if [ "$BANDWIDTH" != "" ]; then
        bandwidth_arg="rate $BANDWIDTH"
    fi
    if [ "$RANDOM_LOSS_PERCENT" != "" ]; then
        random_loss_arg="loss random $RANDOM_LOSS_PERCENT"
    fi
    if [ "$REORDER_PERCENT" != "" ]; then
        reorder_arg="reorder $REORDER_PERCENT"
    fi
    tc qdisc add dev $INTERFACE root netem $delay_arg $bandwidth_arg $random_loss_arg $reorder_arg
}

function getTCArgs () {
    NONTC=()
    while [[ $# -gt 0 ]]; do
        key="$1"
        case $key in
            --tc)
            TC=1
            shift
            ;;
            -d|--tc_delay)
            DELAY="$2"
            shift 2;
            ;;
            --tc_jitter)
            JITTER="$2"
            shift 2;
            ;;
            -b|--tc_bandwidth)
            BANDWIDTH="$2"
            shift 2;
            ;;
            --tc_random_loss)
            RANDOM_LOSS_PERCENT="$2"
            shift 2;
            ;;
            --tc_reorder)
            REORDER_PERCENT="$2"
            shift 2;
            ;;
            *)    # unknown option
            NONTC+=("$1") # save it in an array for later
            shift # past argument
            ;;
        esac
    done
}

getTCArgs $@

if [ $TC -eq 1 ]; then
    echo "Setting up Traffic Control" 
    setupTC
fi
