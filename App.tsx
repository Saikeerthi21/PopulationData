import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
} from 'react-native';

type PopulationData = {
  'ID State': string;
  State: string;
  'ID Year': string;
  Year: string;
  Population: number;
  'Slug State': string;
};

const App = () => {
  const [isLoading, setLoading] = useState(true);
  const [data, setData] = useState<PopulationData[]>([]);
  const [filteredData, setFilteredData] = useState<PopulationData[]>([]);
  const [searchText, setSearchText] = useState('');
  const [apiCallStatus, setApiCallStatus] = useState('');

  // API call for getting the population data
  const getPopulation = async () => {
    try {
      setApiCallStatus('In Progress');
      const response = await fetch(
        'https://datausa.io/api/data?drilldowns=State&measures=Population&year=latest',
      );
      const json = await response.json();
      const sortedList = json.data?.sort(
        (a: PopulationData, b: PopulationData) => {
         // display list of US states ordered by Descending population
          return b.Population - a.Population;
        },
      );
      setApiCallStatus('Completed');
      setData(sortedList);
    } catch (error) {
      console.error(error);
      setApiCallStatus('Failed');
      Alert.alert(
        'Error',
        'Failed to load the population data. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getPopulation();
  }, []);

  const renderItem = ({item}) => {
    return (
      <View>
        <Text style={styles.stateNameStyle}>{item.State}</Text>
        <Text style={styles.populationStyle}>
          Population: {item.Population}
        </Text>
      </View>
    );
  };

  const renderItemSeparator = () => {
    return <View style={styles.itemSeparator} />;
  };

  const filterStateNames = (text: string) => {
    const filterData = data.filter(item => {
      const stateName = item.State;
      //display list of US states where name begins with value of input
      return stateName.startsWith(text);
    });
    //ordered by name, descending
    const descendingOrder = filterData?.sort((a,b) => {
      return (a.State > b.State ? -1 : 1)
    });
    setFilteredData(descendingOrder);
    setSearchText(text);
  };

  const renderStateListView = () => {
    const values = searchText?.length > 0 ? filteredData : data;
    return (
      <FlatList
        refreshing={true}
        data={values}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        ItemSeparatorComponent={renderItemSeparator}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeAreaViewStyle}>
      <View style={styles.container}>
        <Text style={styles.statusText}>Status of API: {apiCallStatus}</Text>
        {isLoading ? (
          <ActivityIndicator />
        ) : (
          <View style={styles.container}>
            {data.length > 0 && (
              <View>
                <TextInput
                  style={styles.textInputStyle}
                  placeholder={'Filter'}
                  onChangeText={text => filterStateNames(text)}
                />
              </View>
            )}
            {renderStateListView()}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeAreaViewStyle: {
    flex: 1,
  },
  container: {
    flex: 1,
    marginTop: 10,
  },
  stateNameStyle: {
    padding: 10,
    fontSize: 18,
  },
  populationStyle: {
    padding: 10,
    fontSize: 14,
  },
  itemSeparator: {
    height: 1,
    width: '100%',
    backgroundColor: '#C8C8C8',
  },
  textInputStyle: {
    fontSize: 16,
    lineHeight: 18,
    height: 44,
    paddingLeft: 10,
    borderRadius: 8,
    borderWidth: 1,
    margin: 8,
  },
  statusText: {
    margin: 8,
  },
});

export default App;
